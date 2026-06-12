const emailRegex = /^[^\s@]+@[^\s@]+$/;

export const validateUserId = (req, res, next, id) => {
  const userId = Number(id);

  if (!Number.isSafeInteger(userId) || userId < 1) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  req.params.id = userId;
  next();
};

//for post

export const validateUser = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [
    !name?.trim() && "name is required",
    !email?.trim()
      ? "email is required"
      : !emailRegex.test(email) && "email format is invalid",
  ].filter((i) => Boolean(i));

  if (errors.length)
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });

  next();
};

//for put

export const validatePartialUser = (req, res, next) => {
  const { name, email } = req.body;
  const errors = [
    name !== undefined && !name?.trim() && "name cannot be empty",
    email !== undefined && !emailRegex.test(email) && "email format is invalid",
  ].filter((i) => Boolean(i));

  if (errors.length)
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });

  next();
};
