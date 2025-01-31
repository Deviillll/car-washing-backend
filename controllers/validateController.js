import jwt from "jsonwebtoken";
const validateController = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error(
        "Access denied. No token provided or invalid format."
      );
      res.status(401);
      throw error;
    }
    const token = authHeader.split(" ")[1];
  
  
    if (!token) {
        const error = new Error("Access denied. No token provided.");
        res.status(401);
        throw error;
    }
     try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
          const error = new Error("Invalid Token");
          res.status(400);
          throw error;
        }

        return res.status(200).json({status:"200",message:"Token is valid"});
      
        
      } catch (ex) {
        res.status(400);
        throw new Error(ex);
      }

  
  
   


    }
    export default validateController;
