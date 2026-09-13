// Illustrative, order-of-magnitude model of annual money circulation in the
// Indian economy, in ₹ lakh crore (1 lakh crore = ₹1 trillion / ~$120bn).
// Grounded in approximate FY2024–25 public figures (RBI Annual Report & MPR,
// Union Budget documents, CSO National Accounts / PFCE-GDP shares, Ministry
// of Commerce trade data, World Bank remittance estimates) recalled from
// training data — NOT freshly looked up. Treat as a teaching/illustrative
// model of scale and direction, not an audited national-accounts reconciliation.

export const CATEGORY_COLORS = {
  monetary: "#5B8FBF",   // RBI
  government: "#C9A227", // Government
  banks: "#3E8E7E",      // Commercial banks
  markets: "#8A6FB0",    // Capital markets
  households: "#C1587A", // Households
  business: "#B5651D",   // Business & industry
  foreign: "#4FA3A3",    // Foreign sector
  informal: "#6E7B6D"    // Informal economy
};

export const nodes = [
  { id: "rbi",        name: "Reserve Bank of India", category: "monetary",
    blurb: "India's central bank — issues currency, sets policy rates, manages forex reserves and lends to the banking system." },
  { id: "govt",       name: "Government (Union + States)", category: "government",
    blurb: "Collects taxes, borrows in capital markets, and spends on salaries, subsidies, welfare and capital projects." },
  { id: "banks",      name: "Commercial Banks", category: "banks",
    blurb: "Take deposits and extend credit — the main channel between the RBI, savers and borrowers." },
  { id: "markets",    name: "Capital Markets", category: "markets",
    blurb: "Equity, debt and mutual-fund markets that channel household savings into government and corporate funding." },
  { id: "households", name: "Households", category: "households",
    blurb: "Earn wages, pay taxes, consume, save and borrow — the largest single node in the circulatory system." },
  { id: "business",   name: "Businesses & Industry", category: "business",
    blurb: "Corporates and MSMEs that produce goods and services, pay wages and taxes, and trade with the world." },
  { id: "foreign",    name: "Foreign Sector", category: "foreign",
    blurb: "Exports, imports, remittances and foreign investment connecting India to the rest of the world." },
  { id: "informal",   name: "Informal Economy", category: "informal",
    blurb: "Cash-based, largely unorganised trade, services and labour — a substantial parallel circulatory loop." }
];

// value units: ₹ lakh crore per year (approximate order of magnitude)
export const links = [
  { source: "rbi", target: "banks", value: 34, label: "Currency issuance & liquidity (repo operations)" },
  { source: "banks", target: "rbi", value: 20, label: "CRR / SLR reserve requirements" },
  { source: "rbi", target: "govt", value: 2.1, label: "RBI surplus transferred to government" },

  { source: "markets", target: "govt", value: 15, label: "G-Sec subscriptions (market borrowing)" },
  { source: "govt", target: "markets", value: 11, label: "Interest on public debt" },

  { source: "banks", target: "households", value: 45, label: "Retail loans & deposit interest paid" },
  { source: "households", target: "banks", value: 60, label: "Household deposits" },
  { source: "banks", target: "business", value: 70, label: "Corporate & MSME credit" },
  { source: "business", target: "banks", value: 55, label: "Loan repayments & corporate deposits" },

  { source: "households", target: "govt", value: 20, label: "Income tax & GST (consumer incidence)" },
  { source: "business", target: "govt", value: 25, label: "Corporate tax & GST remitted" },
  { source: "govt", target: "households", value: 12, label: "Subsidies, wages & welfare transfers" },
  { source: "govt", target: "business", value: 11, label: "Capex, PSU funding & PLI incentives" },

  { source: "households", target: "business", value: 165, label: "Consumer spending (PFCE)" },
  { source: "business", target: "households", value: 90, label: "Wages & salaries" },

  { source: "households", target: "markets", value: 25, label: "Financial savings — equity, MF, insurance" },
  { source: "markets", target: "households", value: 10, label: "Dividends, interest & redemptions" },
  { source: "markets", target: "business", value: 18, label: "Equity & debt capital raised" },

  { source: "foreign", target: "business", value: 65, label: "Export earnings & FDI inflows" },
  { source: "business", target: "foreign", value: 71, label: "Import payments" },
  { source: "foreign", target: "households", value: 10, label: "Remittances from abroad" },

  { source: "households", target: "informal", value: 30, label: "Cash spending — unorganised trade & services" },
  { source: "informal", target: "households", value: 20, label: "Informal wages & petty income" },
  { source: "business", target: "informal", value: 18, label: "Cash payments to informal suppliers & labour" },
  { source: "informal", target: "business", value: 22, label: "Informal-sector output sold into formal supply chains" }
];
