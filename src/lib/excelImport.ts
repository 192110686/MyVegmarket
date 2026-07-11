import * as XLSX from "xlsx";

export type ExcelPriceRow = {
  rowNumber: number;
  item: string;
  rate: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  origin: string;
  min: number;
  max: number;
  category: string;
};

export type ExcelRowError = {
  rowNumber: number;
  message: string;
};

export type ExcelParseResult = {
  rows: ExcelPriceRow[];
  errors: ExcelRowError[];
  totalRows: number;
  sheetName: string;
};

type RawExcelRow = Record<string, unknown>;

const HEADER_ALIASES = {
  item: [
    "item",
    "product",
    "product name",
    "product_name",
    "item name",
    "item_name",
    "commodity",
  ],
  rate: [
    "rate",
    "price",
    "market price",
    "market_price",
    "market rate",
    "market_rate",
  ],
  date: ["date", "price date", "price_date"],
  time: ["time", "price time", "price_time"],
  origin: [
    "origin",
    "country",
    "origin country",
    "origin_country",
    "country of origin",
  ],
  min: [
    "min",
    "minimum",
    "minimum price",
    "min price",
    "min_price",
  ],
  max: [
    "max",
    "maximum",
    "maximum price",
    "max price",
    "max_price",
  ],
  category: [
    "category",
    "product category",
    "product_category",
    "item category",
  ],
} as const;

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function findValue(
  row: RawExcelRow,
  aliases: readonly string[]
): unknown {
  const normalizedAliases = aliases.map(normalizeHeader);

  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeHeader(key);

    if (normalizedAliases.includes(normalizedKey)) {
      return value;
    }
  }

  return undefined;
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value ?? "")
    .trim()
    .replace(/,/g, "")
    .replace(/AED/gi, "")
    .replace(/[^\d.-]/g, "");

  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDateParts(
  year: number,
  month: number,
  day: number
): string | null {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  if (year < 2000 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseExcelDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateParts(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate()
    );
  }

  // Excel serial date, for example 46214
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      return formatDateParts(parsed.y, parsed.m, parsed.d);
    }
  }

  const text = cleanText(value);
  if (!text) return null;

  // YYYY-MM-DD or YYYY/MM/DD
  let match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

  if (match) {
    return formatDateParts(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    );
  }

  // DD-MM-YYYY or DD/MM/YYYY
  match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (match) {
    return formatDateParts(
      Number(match[3]),
      Number(match[2]),
      Number(match[1])
    );
  }

  const parsedDate = new Date(text);

  if (!Number.isNaN(parsedDate.getTime())) {
    return formatDateParts(
      parsedDate.getFullYear(),
      parsedDate.getMonth() + 1,
      parsedDate.getDate()
    );
  }

  return null;
}

function parseExcelTime(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;
  }

  // Excel stores time as a fraction of one day.
  // Example: 0.5 = 12:00.
  if (typeof value === "number" && Number.isFinite(value)) {
    const fraction = value >= 1 ? value % 1 : value;
    const totalMinutes = Math.round(fraction * 24 * 60);

    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;

    return `${pad2(hours)}:${pad2(minutes)}`;
  }

  const text = cleanText(value);
  if (!text) return null;

  // 24-hour format: 08:30 or 08:30:00
  let match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (match) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${pad2(hours)}:${pad2(minutes)}`;
    }
  }

  // 12-hour format: 8:30 AM
  match = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (match) {
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3].toUpperCase();

    if (
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;

    return `${pad2(hours)}:${pad2(minutes)}`;
  }

  return null;
}

function normalizeCategory(value: unknown): string {
  const category = cleanText(value).toLowerCase();

  const categoryMap: Record<string, string> = {
    fruit: "fruits",
    fruits: "fruits",

    vegetable: "vegetables",
    vegetables: "vegetables",
    veggie: "vegetables",
    veggies: "vegetables",

    spice: "spices",
    spices: "spices",

    nut: "nuts",
    nuts: "nuts",

    egg: "eggs",
    eggs: "eggs",

    oil: "oils",
    oils: "oils",
  };

  return categoryMap[category] ?? category;
}

function validateRow(
  row: RawExcelRow,
  rowNumber: number
): {
  row?: ExcelPriceRow;
  errors: ExcelRowError[];
} {
  const errors: ExcelRowError[] = [];

  const item = cleanText(findValue(row, HEADER_ALIASES.item));
  const rate = parseNumber(findValue(row, HEADER_ALIASES.rate));
  const date = parseExcelDate(findValue(row, HEADER_ALIASES.date));
  const time = parseExcelTime(findValue(row, HEADER_ALIASES.time));
  const origin = cleanText(findValue(row, HEADER_ALIASES.origin));
  const min = parseNumber(findValue(row, HEADER_ALIASES.min));
  const max = parseNumber(findValue(row, HEADER_ALIASES.max));
  const category = normalizeCategory(
    findValue(row, HEADER_ALIASES.category)
  );

  if (!item) {
    errors.push({
      rowNumber,
      message: "Item/Product name is missing.",
    });
  }

  if (rate === null || rate <= 0) {
    errors.push({
      rowNumber,
      message: "Rate must be a number greater than zero.",
    });
  }

  if (!date) {
    errors.push({
      rowNumber,
      message: "Date is missing or invalid.",
    });
  }

  if (!time) {
    errors.push({
      rowNumber,
      message: "Time is missing or invalid.",
    });
  }

  if (!origin) {
    errors.push({
      rowNumber,
      message: "Origin is missing.",
    });
  }

  if (min === null || min < 0) {
    errors.push({
      rowNumber,
      message: "Min must be a valid non-negative number.",
    });
  }

  if (max === null || max < 0) {
    errors.push({
      rowNumber,
      message: "Max must be a valid non-negative number.",
    });
  }

  if (min !== null && max !== null && min > max) {
    errors.push({
      rowNumber,
      message: "Min cannot be greater than Max.",
    });
  }

  if (
    rate !== null &&
    min !== null &&
    max !== null &&
    (rate < min || rate > max)
  ) {
    errors.push({
      rowNumber,
      message: "Rate must be between Min and Max.",
    });
  }

  const allowedCategories = [
    "vegetables",
    "fruits",
    "spices",
    "nuts",
    "eggs",
    "oils",
  ];

  if (!category) {
    errors.push({
      rowNumber,
      message: "Category is missing.",
    });
  } else if (!allowedCategories.includes(category)) {
    errors.push({
      rowNumber,
      message:
        'Invalid category. Use vegetables, fruits, spices, nuts, eggs, or oils.',
    });
  }

  if (
    errors.length > 0 ||
    rate === null ||
    !date ||
    !time ||
    min === null ||
    max === null
  ) {
    return { errors };
  }

  return {
    errors: [],
    row: {
      rowNumber,
      item,
      rate,
      date,
      time,
      origin,
      min,
      max,
      category,
    },
  };
}

export async function parsePriceExcelFile(
  file: File
): Promise<ExcelParseResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !["xlsx", "xls"].includes(extension)) {
    throw new Error("Please upload a valid .xlsx or .xls Excel file.");
  }

  const arrayBuffer = await file.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, {
    type: "array",
    cellDates: true,
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("The Excel file does not contain any worksheets.");
  }

  const worksheet = workbook.Sheets[sheetName];

  const rawRows = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, {
    defval: "",
    raw: true,
  });

  if (rawRows.length === 0) {
    throw new Error("The first Excel worksheet contains no data.");
  }

  const rows: ExcelPriceRow[] = [];
  const errors: ExcelRowError[] = [];

  rawRows.forEach((rawRow, index) => {
    // Row 1 contains headers, so first data row is Excel row 2.
    const rowNumber = index + 2;
    const result = validateRow(rawRow, rowNumber);

    if (result.row) {
      rows.push(result.row);
    }

    errors.push(...result.errors);
  });

  return {
    rows,
    errors,
    totalRows: rawRows.length,
    sheetName,
  };
}