import mongoose from "mongoose";
import Catagory from "../models/catagory.js";
import CompanyProfile from "../models/companyProfile.js";
import Resolver from "../models/resolver.js";
import Role from "../models/role.js";
import Service from "../models/service.js";

class ServiceClass {
  static async createServices(req, res) {
   try {
    const { name, description, price, companyId, time ,category} = req.body;

    const userId = req.user;
    const role = req.role;

    if (!name || !description || !price || !companyId || !time || !category) {
      res.status(400);
      throw new Error("Please fill all fields");
    }
   

    const getRole = await Role.findById({ _id: role });
    if (!getRole) {
      res.status(401);
      throw new Error("Unauthorized access");
    }

    if (getRole.role !== "admin" && getRole.role !== "manager") {
      res.status(401);
      throw new Error("Unauthorized access");
    }
    const objectRoleID = mongoose.isValidObjectId(companyId);

    if (!objectRoleID) {
      res.status(400);
      throw new Error("Invalid company");
    }

    const objectCatagoryID = mongoose.isValidObjectId(category);

    if (!objectCatagoryID) {
      res.status(400);
      throw new Error("Invalid category");
    }

    const resolver = await Resolver.findOne({
      user_id: userId,
      company_id: companyId,
    });

    if (!resolver) {
      res.status(401);
      throw new Error("Unauthorized access");
    }

    const newService = new Service({
      name,
      description,
      price,
      company: companyId,
      time,
     category,
    });

    let q = await newService.save();
    if (q) {
      res
        .status(200)
        .json({ status: 200, message: "Service created successfully." });
    } else {
      res.status(500);
      throw new Error("Internal Server Error.");
    }
    
   } catch (error) {
    throw new Error(error.message);

    
   }
  }


  static async getServices(req, res) {
    try {
      const { companyId } = req.body;
      const userId = req.user;
      const role = req.role;

      if (!companyId) {
        res.status(400);
        throw new Error("company id is required");
      }

      const getRole = await Role.findById({ _id: role });
      if (!getRole) {
        res.status(401);
        throw new Error("Unauthorized access");
      }

      if (getRole.role !== "admin" && getRole.role !== "manager") {
        res.status(401);
        throw new Error("Unauthorized access");
      }
      const objectRoleID = mongoose.isValidObjectId(companyId);

      if (!objectRoleID) {
        res.status(400);
        throw new Error("Invalid company");
      }

      const resolver = await Resolver.findOne({
        user_id: userId,
        company_id: companyId
      });
      if (!resolver) {
        res.status(401);
        throw new Error("Unauthorized access");
      }

      const service = await Service.find({ company: companyId });
      if (!service) {
        res.status(404);

        throw new Error("No service found");

      }

      return res
        .status(200)
        .json({
          status: 200,
          message: "data fetch successfully",
          data: service,
        });
    } catch (error) {
      throw new Error(error.message);
    }
  }

 static async addCatagory(req, res) {
    try {
      const { name, description, companyId } = req.body;

    const userId = req.user;
    const role = req.role;
    const file = req.file;

    if (!req.file) {
      res.status(400);
      throw new Error("Please upload a logo");
    }


    if (!name || !description || !companyId) {
      res.status(400);
      throw new Error("Please fill all fields");
    }

    const getRole = await Role.findById({ _id: role });
    if (!getRole) {
      res.status(401);
      throw new Error("Unauthorized access");
    }

    if (getRole.role !== "admin" && getRole.role !== "manager") {
      res.status(401);
      throw new Error("Unauthorized access");
    }
    const objectRoleID = mongoose.isValidObjectId(companyId);

    if (!objectRoleID) {
      res.status(400);
      throw new Error("Invalid company");
    }

   

    const resolver = await Resolver.findOne({
      user_id: userId,
      company_id: companyId,
    });

    if (!resolver) {
      res.status(401);
      throw new Error("Unauthorized access");
    }

    const catagoryExist = await Catagory.findOne({ name, company: companyId });
    if (catagoryExist) {
      res.status(400);
      throw new Error("Catagory already exist");
    }

    const newCatagory = new Catagory({
      name,
      description,
      icon: file.path,
      company: companyId,
    });

    let q = await newCatagory.save();
    if (q) {
      res
        .status(200)
        .json({ status: 200, message: "Catagory created successfully." });
    } else {
      res.status(500);
      throw new Error("Internal Server Error.");
    }
      
    } catch (error) {
      
      throw new Error(error.message);
    }
  }

  // get all categories
  static async getCatagory(req, res) {
    try {
      const { companyId } = req.body;
      const userId = req.user;
      const role = req.role;

      if (!companyId) {
        res.status(400);
        throw new Error("company id is required");
      }

      const getRole = await Role.findById({ _id: role });
      if (!getRole) {
        res.status(401);
        throw new Error("Unauthorized access");
      }

      if (getRole.role !== "admin" && getRole.role !== "manager") {
        res.status(401);
        throw new Error("Unauthorized access");
      }
      const objectRoleID = mongoose.isValidObjectId(companyId);

      if (!objectRoleID) {
        res.status(400);
        throw new Error("Invalid company");
      }

      const resolver = await Resolver.findOne({
        user_id: userId,
        company_id: companyId
      });


      if (!resolver) {
        res.status(401);
        throw new Error("Unauthorized access");
      }

      const catagory = await Catagory.find({ company: companyId });
      if (!catagory) {
        res.status(404);
        throw new Error("No catagory found");
      }

      return res
        .status(200)
        .json({
          status: 200,
          message: "data fetch successfully",
          data: catagory,
        });


      } catch (error) {
        throw new Error(error.message);
      }
    }   
}



export default ServiceClass;
