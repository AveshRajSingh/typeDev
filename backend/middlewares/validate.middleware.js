

export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
}