import * as d3 from "d3";
import { sankeyCircular, sankeyJustify } from "d3-sankey-circular";
import { nodes as rawNodes, links as rawLinks, CATEGORY_COLORS } from "./data.js";

const fmt = (v) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 1 })} LCr/yr`;

const stage = document.getElementById("stage");
const svg = d3.select("#sankey-svg");
const linkLayer = svg.append("g").attr("class", "link-layer");
const nodeLayer = svg.append("g").attr("class", "node-layer");
const labelLayer = svg.append("g").attr("class", "label-layer");
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

const inspector = document.getElementById("inspector");
const inspectorTitle = document.getElementById("inspector-title");
const inspectorBody = document.getElementById("inspector-body");
const inspectorClose = document.getElementById("inspector-close");

let graph = null;
let particles = []; // { link, phase, duration, radius, color }
let running = true;
let rafId = null;
let speedMultiplier = 1;
let lastTime = null;
let width = 0, height = 0;

function buildLegend() {
  const legend = document.getElementById("legend");
  legend.innerHTML = "";
  rawNodes.forEach((n) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.background = CATEGORY_COLORS[n.category] || "#888";
    item.appendChild(swatch);
    item.appendChild(document.createTextNode(n.name));
    legend.appendChild(item);
  });
}

function cloneData() {
  return {
    nodes: rawNodes.map((d) => ({ ...d })),
    links: rawLinks.map((d) => ({ ...d }))
  };
}

function computeLayout() {
  const rect = stage.getBoundingClientRect();
  width = rect.width;
  height = rect.height;

  const sideMargin = width < 720 ? 100 : 190;
  const margin = { top: 28, right: sideMargin, bottom: 28, left: sideMargin };
  const innerW = Math.max(320, width - margin.left - margin.right);
  const innerH = Math.max(320, height - margin.top - margin.bottom);

  const data = cloneData();

  const sankey = sankeyCircular()
    .nodeId((d) => d.id)
    .nodeAlign(sankeyJustify)
    .nodeWidth(16)
    .nodePadding(34)
    .circularLinkGap(4)
    .iterations(48)
    .extent([[margin.left, margin.top], [margin.left + innerW, margin.top + innerH]]);

  graph = sankey(data);

  svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
  canvas.width = Math.round(width * devicePixelRatio);
  canvas.height = Math.round(height * devicePixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  ctx.fillStyle = "#12141c";
  ctx.fillRect(0, 0, width, height);

  render();
}

function nodeColor(node) {
  return CATEGORY_COLORS[node.category] || "#888";
}

function render() {
  // --- links ---
  const linkSel = linkLayer.selectAll("path.flow").data(graph.links, (d) => `${d.source.id}-${d.target.id}-${d.label}`);
  linkSel.exit().remove();
  const linkEnter = linkSel.enter()
    .append("path")
    .attr("class", "flow");

  linkEnter.merge(linkSel)
    .attr("d", (d) => d.path)
    .attr("stroke", (d) => nodeColor(d.source))
    .attr("stroke-width", (d) => Math.max(1.2, d.width))
    .attr("stroke-opacity", 0.28)
    .attr("data-circular", (d) => !!d.circular)
    .each(function(d) { d._domNode = this; })
    .on("mouseenter", (event, d) => highlightLink(d))
    .on("mouseleave", () => clearHighlight())
    .on("click", (event, d) => showLinkDetail(d));

  // --- nodes ---
  const nodeSel = nodeLayer.selectAll("rect.node").data(graph.nodes, (d) => d.id);
  nodeSel.exit().remove();
  const nodeEnter = nodeSel.enter().append("rect").attr("class", "node").attr("rx", 3);

  nodeEnter.merge(nodeSel)
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => Math.max(2, d.y1 - d.y0))
    .attr("fill", (d) => nodeColor(d))
    .on("mouseenter", (event, d) => highlightNode(d))
    .on("mouseleave", () => clearHighlight())
    .on("click", (event, d) => showNodeDetail(d));

  // --- labels ---
  const labelSel = labelLayer.selectAll("text.node-label").data(graph.nodes, (d) => d.id);
  labelSel.exit().remove();
  const labelEnter = labelSel.enter().append("text").attr("class", "node-label");

  labelEnter.merge(labelSel)
    .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 10 : d.x0 - 10))
    .attr("y", (d) => (d.y0 + d.y1) / 2)
    .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
    .attr("dominant-baseline", "middle")
    .text((d) => d.name);

  buildParticles();
}

function buildParticles() {
  particles = [];
  graph.links.forEach((link) => {
    if (!link._domNode) return;
    link._len = link._domNode.getTotalLength();
    const count = Math.min(16, Math.max(2, Math.round(Math.sqrt(link.value) * 1.5)));
    const duration = 6500 + (1 / Math.max(0.2, link.value)) * 4000; // slower for thin flows
    const color = nodeColor(link.source);
    for (let i = 0; i < count; i++) {
      particles.push({
        link,
        phase: i / count + Math.random() * (1 / count) * 0.6,
        duration,
        radius: 1.6 + Math.min(2.4, link.value / 60),
        color,
      });
    }
  });
}

function tick(now) {
  if (lastTime === null) lastTime = now;
  const dt = now - lastTime;
  lastTime = now;

  if (running) {
    // trailing fade for a "blood flow" glow effect
    ctx.fillStyle = "rgba(18,20,28,0.22)";
    ctx.fillRect(0, 0, width, height);

    particles.forEach((p) => {
      p.phase += (dt * speedMultiplier) / p.duration;
      if (p.phase > 1) p.phase -= Math.floor(p.phase);
      const pt = p.link._domNode.getPointAtLength(p.phase * p.link._len);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.9;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  if (running) rafId = requestAnimationFrame(tick);
}

function highlightLink(d) {
  linkLayer.selectAll("path.flow").attr("stroke-opacity", (o) => (o === d ? 0.85 : 0.08));
  showLinkDetail(d, true);
}
function highlightNode(d) {
  linkLayer.selectAll("path.flow").attr("stroke-opacity", (o) => (o.source === d || o.target === d ? 0.75 : 0.08));
  showNodeDetail(d, true);
}
function clearHighlight() {
  linkLayer.selectAll("path.flow").attr("stroke-opacity", 0.28);
  if (inspector.dataset.transient === "1") inspector.classList.remove("open");
}

function showNodeDetail(d, transient) {
  const inflow = graph.links.filter((l) => l.target === d).reduce((s, l) => s + l.value, 0);
  const outflow = graph.links.filter((l) => l.source === d).reduce((s, l) => s + l.value, 0);
  inspectorTitle.textContent = d.name;
  inspectorBody.innerHTML = "";
  const blurbP = document.createElement("p");
  blurbP.textContent = d.blurb;
  const dl = document.createElement("dl");
  dl.innerHTML = `<dt>Inflow</dt><dd></dd><dt>Outflow</dt><dd></dd>`;
  dl.querySelectorAll("dd")[0].textContent = fmt(inflow);
  dl.querySelectorAll("dd")[1].textContent = fmt(outflow);
  inspectorBody.appendChild(blurbP);
  inspectorBody.appendChild(dl);
  inspector.classList.add("open");
  inspector.dataset.transient = transient ? "1" : "0";
}

function showLinkDetail(d, transient) {
  inspectorTitle.textContent = `${d.source.name} → ${d.target.name}`;
  inspectorBody.innerHTML = "";
  const labelP = document.createElement("p");
  labelP.textContent = d.label;
  const dl = document.createElement("dl");
  dl.innerHTML = `<dt>Flow</dt><dd></dd>`;
  dl.querySelector("dd").textContent = fmt(d.value);
  inspectorBody.appendChild(labelP);
  inspectorBody.appendChild(dl);
  if (d.circular) {
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = "This is a return / feedback flow in the cycle.";
    inspectorBody.appendChild(note);
  }
  inspector.classList.add("open");
  inspector.dataset.transient = transient ? "1" : "0";
}

inspectorClose.addEventListener("click", () => inspector.classList.remove("open"));

document.getElementById("play-toggle").addEventListener("click", (e) => {
  running = !running;
  e.currentTarget.textContent = running ? "Pause" : "Play";
  if (running) {
    lastTime = null;
    rafId = requestAnimationFrame(tick);
  } else {
    cancelAnimationFrame(rafId);
  }
});

document.getElementById("speed").addEventListener("input", (e) => {
  speedMultiplier = Number(e.target.value);
});

document.getElementById("info-toggle").addEventListener("click", () => {
  document.getElementById("about-panel").classList.toggle("open");
});
document.getElementById("about-close").addEventListener("click", () => {
  document.getElementById("about-panel").classList.remove("open");
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(computeLayout, 200);
});

buildLegend();
computeLayout();
rafId = requestAnimationFrame(tick);
