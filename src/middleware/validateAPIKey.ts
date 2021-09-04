import {NextFunction, Request, Response} from "express"
import {config as loadEnvironmentVariables} from "dotenv"
import {verify as verifyJWT} from "jsonwebtoken"

loadEnvironmentVariables()

const validateAPIKey = (req: Request, res: Response, next: NextFunction): Response => {
  if (!req.headers || !req.headers.authorization) {
    return res.status(400).json({error: "No authorization headers were supplied."})
  }

  const bearerTokenParts = req.headers.authorization.split(" ")
  if (bearerTokenParts.length !== 2) {
    return res.status(400).json({error: "Malformed API key."})
  }

  const token = bearerTokenParts[1]
  verifyJWT(token, process.env.JWT_SECRET, (err) => {
    if (err) {
      return res.status(500).json({auth: false, error: "Invalid API key."})
    }

    return next()
  })
}

export default validateAPIKey
