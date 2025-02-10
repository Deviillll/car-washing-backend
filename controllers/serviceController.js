import mongoose from "mongoose";
import Catagory from "../models/catagory.js";
import CompanyProfile from "../models/companyProfile.js";
import Resolver from "../models/resolver.js";
import Role from "../models/role.js";
import Service from "../models/service.js";

class ServiceClass {
  static async createServices(req, res) {
   try {
    const { serviceName, serviceDescription, servicePrice, companyId, serviceTime ,categoryId} = req.body;

    const userId = req.user;
    const role = req.role;

    if (!serviceName || !serviceDescription || !servicePrice || !companyId || !serviceTime || !categoryId) {
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
    const objectCompanyId = mongoose.Types.ObjectId.createFromHexString(companyId);
    const validCompanyId = mongoose.isValidObjectId(objectCompanyId);

    if (!validCompanyId) {
      res.status(400);
      throw new Error("Invalid company");
    }
    const objectCategoryId = mongoose.Types.ObjectId.createFromHexString(categoryId);
    
    const validCategoryId = mongoose.isValidObjectId(objectCategoryId);

    if (!validCategoryId) {
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
      name: serviceName,
      description: serviceDescription,
      price: servicePrice,
      company: companyId,
      time: serviceTime,
     category:categoryId,
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
    const {objectId}=mongoose.Types;
    try {
        const { companyId } = req.query;
        const userId = req.user;
        const role = req.role;

        if (!companyId) {
            return res.status(400).json({ error: "Company ID is required" });
        }

        const getRole = await Role.findById({ _id: role });
        if (!getRole) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        if (getRole.role !== "admin" && getRole.role !== "manager") {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        const objectCompanyId = mongoose.Types.ObjectId.createFromHexString(companyId);
        const isValidObjectId = mongoose.isValidObjectId(objectCompanyId);
        if (!isValidObjectId) {
            return res.status(400).json({ error: "Invalid company" });
        }

        const resolver = await Resolver.findOne({
            user_id: userId,
            company_id: companyId
        });
        if (!resolver) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        //const services = await Service.find({ company: objectCompanyId });

        const services = await Service.aggregate([
            { $match: { company: objectCompanyId } },
            {
                $lookup: {
                    from: 'tbl_categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $lookup: {
                    from: 'tbl_companyprofiles',
                    localField: 'company',
                    foreignField: '_id',
                    as: 'companyDetails'
                }
            },
            {
                $unwind: '$categoryDetails'
            },
            {
                $unwind: '$companyDetails'
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    time: 1,
                    categoryName: '$categoryDetails.name',
                    companyName: '$companyDetails.',
                    categoryId: '$categoryDetails._id',
                    companyId: '$companyDetails._id'
                }
            }
        ]);
      
      

        if (!services || services.length === 0) {
            return res.status(404).json({ error: "No service found" });
        }

        return res.status(200).json({
            status: 200,
            message: "Data fetched successfully",
            data: services,
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}


 static async addCatagory(req, res) {
  const { ObjectId } = mongoose.Types;
    try {
      const { name, description, companyId } = req.body;

    const userId = req.user;
    const role = req.role;
    const file = req.file;

    if (!req.file) {
      res.status(400);
      throw new Error("Please upload a logo");
    }
//console.log(companyId);
// const objectId2 =new ObjectId(companyId);
// console.log(objectId2);

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
    const objectCompanyId = mongoose.Types.ObjectId.createFromHexString(companyId);
    const objectRoleID = mongoose.isValidObjectId(objectCompanyId);
    //console.log(objectCompanyId);

    //console.log(objectRoleID);

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
    const { companyId } = req.query;  // Ensure companyId is being passed as a query parameter
    try {

        const userId = req.user;
        const role = req.role;

        if (!companyId) {
            return res.status(400).json({ error: "Company ID is required" });
        }

        const getRole = await Role.findById({ _id: role });
        if (!getRole) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        if (getRole.role !== "admin" && getRole.role !== "manager") {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const objectCompanyId = mongoose.Types.ObjectId.createFromHexString(companyId);
        const objectRoleID = mongoose.isValidObjectId(objectCompanyId);

        if (!objectRoleID) {
            return res.status(400).json({ error: "Invalid company" });
        }

        const resolver = await Resolver.findOne({
            user_id: userId,
            company_id: companyId
        });

        if (!resolver) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const catagory = await Catagory.find({ company: companyId });
        if (!catagory) {
            return res.status(404).json({ error: "No category found" });
        }

        return res.status(200).json({
            status: 200,
            message: "Data fetched successfully",
            data: catagory,
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

    
    // delete category
    static async deleteCatagory(req, res) {
      try {
        const { catagoryId } = req.body;
        const userId = req.user;
        const role = req.role;
    
        if (!catagoryId) {
          res.status(400);
          throw new Error("catagory id is required");
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
        const objectRoleID = mongoose.isValidObjectId(catagoryId);
    
        if (!objectRoleID) {
          res.status(400);
          throw new Error("Invalid catagory");
        }
    
        const resolver = await Resolver.findOne({
          user_id: userId,
          catagory_id: catagoryId
        });
        if (!resolver) {
          res.status(401);
          throw new Error("Unauthorized access");
        }
    
        const catagory = await Catagory.findByIdAndDelete({ _id: catagoryId }); 
        if (!catagory) {
          res.status(404);
          throw new Error("No catagory found");
        }


        res
          .status(200)
          .json({
            status: 200,
            message: "Catagory deleted successfully",
          });}
          catch(error){
            throw new Error(error.message);
          }
        }



}



export default ServiceClass;
