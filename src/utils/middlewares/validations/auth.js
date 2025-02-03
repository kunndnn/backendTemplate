import { body } from "express-validator";
import Joi from "joi";
export const loginValidations = [
  body("password").notEmpty().withMessage("Please enter password"),
  body("email").notEmpty().withMessage("Please enter email").escape().trim(),
];

export const signupValidations = [
  body("password").notEmpty().withMessage("Please enter old password"),
  body("newPassword").notEmpty().withMessage("Please enter newPassword"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please enter confirmPassword")
    .custom(async (confirmPassword, { req }) => {
      const { newPassword } = req.body;
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords must be same");
      }
    }),
];

//joi validations
export const testValidations = Joi.object({
  search: Joi.string()
    .min(3)
    .required()
    .messages({ "string.min": "Please enter at least 3 characters" }),
});
