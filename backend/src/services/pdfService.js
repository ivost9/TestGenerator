import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Генерира PDF файл за теста и го изпраща към Express response потока
 * @param {Object} test Данните за теста от базата
 * @param {Object} res Express response обекта
 */
export const generateTestPDF = (test, res) => {
  // Създаваме нов PDF документ (А4 формат)
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Задаваме заглавията на HTTP отговора, за да разбере браузърът, че му пращаме PDF за сваляне
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Test_${encodeURIComponent(test.topic)}.pdf`,
  );

  // Свързваме изхода на PDF-а директно с HTTP отговора (Stream)
  doc.pipe(res);

  // --- ВАЖНО: Поддръжка на КИРИЛИЦА ---
  // Използваме системен шрифт, който гарантирано има кирилица (напр. Arial).
  // Ако си на Windows, този път обикновено работи. Ако си на Mac/Linux, може да се зареди локален .ttf файл.
  const fontPath = "C:\\Windows\\Fonts\\arial.ttf";
  if (fs.existsSync(fontPath)) {
    doc.font(fontPath);
  } else {
    // Fallback: Ако не намери Arial, ще пише с вградения (но кирилицата може да се счупи, затова в продукция се качва .ttf файл в проекта)
    doc.font("Helvetica");
  }

  // 1. ХЕДЪР НА ТЕСТА (Място за име, клас, номер)
  doc.fontSize(18).text(test.subject, { align: "center" });

  doc.fontSize(18).text(`${test.grade} Клас`, { align: "center" });
  doc.moveDown(1);

  // Полета за ученика
  doc.fontSize(16).text("Име: __________________________", { align: "left" });

  doc.moveDown(2);

  // 2. ИЗВЕЖДАНЕ НА ВЪПРОСИТЕ (За учениците)
  test.rawQuestions.forEach((q, index) => {
    // Проверка за край на страницата (за да не се застъпят текстовете)
    if (doc.y > 700) doc.addPage();

    doc.fontSize(12).text(`${index + 1}. ${q.question}`, { label: "question" });
    doc.moveDown(0.6);

    // Извеждане на опциите А, Б, В, Г
    q.options.forEach((opt, optIndex) => {
      const letter = String.fromCharCode(1040 + optIndex); // Букви А, Б, В, Г на кирилица
      doc.fontSize(12).text(`   ${letter}) ${opt}`, { lineGap: 6 });
    });

    doc.moveDown(1.5);
  });

  // 3. СТРАНИЦА С ОТГОВОРИ (Само за учителя)
  doc.addPage();
  doc
    .fontSize(18)
    .text("ЛИСТ С ВЕРНИ ОТГОВОРИ (За учителя)", { align: "center" });
  doc.moveDown(1);
  doc.text(
    "------------------------------------------------------------------------------------------------------",
  );
  doc.moveDown(1);

  test.rawQuestions.forEach((q, index) => {
    const correctLetter = String.fromCharCode(1040 + q.correctAnswerIndex);
    doc
      .fontSize(12)
      .text(`${index + 1}. Транспортен отговор: ${correctLetter}`);
    if (q.explanation) {
      doc
        .fontSize(10)
        .fillColor("#d97706")
        .text(`   Обяснение: ${q.explanation}`)
        .fillColor("#000000");
    }
    doc.moveDown(0.5);
  });

  // Финализиране на документа и затваряне на стрийма
  doc.end();
};
