import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  let token;

  // Проверяваме дали токенът е изпратен в Authorization хедъра (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Декодиране на токена
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "super_secret_fallback_key",
      );

      // Записваме данните от токена в обекта на заявката
      req.user = decoded;

      return next(); // Продължаваме напред към контролера
    } catch (error) {
      return res
        .status(401)
        .json({ status: "error", message: "Невалиден или изтекъл токен!" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Нямате достъп, липсва токен!" });
  }
};
