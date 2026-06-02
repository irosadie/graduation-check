import { PrismaClient, Status } from "@prisma/client";
import * as XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

function parseNisn(value: unknown): string {
  if (typeof value === "number") {
    return String(Math.round(value));
  }
  const str = String(value).trim().replace(/'/g, "");
  if (str.includes(".")) {
    return str.replace(".", "").replace(/^0+/, "");
  }
  return str;
}

async function main() {
  const filePath = path.resolve("data/lulus.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets["Sheet1"];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: ["no", "fullname", "nisn"],
  });

  let count = 0;
  for (const row of rows) {
    const fullname = String(row["fullname"] ?? "").trim();
    const rawNisn = row["nisn"];
    if (!fullname || rawNisn == null) continue;

    const nisn = parseNisn(rawNisn);
    if (!nisn) continue;

    await prisma.student.upsert({
      where: { nisn },
      update: { fullname },
      create: { nisn, fullname, status: Status.PASSED, description: null },
    });
    count++;
  }

  console.log(`Seeded ${count} students from lulus.xlsx`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
