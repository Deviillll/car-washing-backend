import CompanyProfile from "../models/companyProfile.js";

import fs from "fs/promises";
import Resolver from "../models/resolver.js";
import User from "../models/user.js";
import Role from "../models/role.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import VerificationToken from "../models/verifyToken.js";
import sendEmail from "../utils/mail/mail.js";
class Company {


  static async createCompanyProfile(req, res) {
    const file = req.file;
    const userId = req.user;
    const role = req.role;
   
    
   
      const roleExist = await Role.findById({ _id: role });
  
      if (roleExist.role !== "admin") {
        res.status(401);
        throw new Error("Unauthorized access");
      }
  
      const { companyName, street, zip, city, email, phone, description ,isMultipleBookingAllow,isAutoConfirmBookingAllow} =
        req.body;
        
  
      if (!req.file) {
        res.status(400);
        throw new Error("Please upload a logo");
      }
      if (
        !companyName ||
        !street ||
        !zip ||
        !city ||
        !email ||
        !phone ||
        !description
      ) {
        res.status(400);
        throw new Error("Please fill all fields");
      }
      const companyExist = await CompanyProfile.find({ user_id: userId });
  
      const totalCompanies = companyExist?.length > 2;
      if (totalCompanies) {
        await fs.unlink(file.path);
        res.status(400);
        throw new Error("You have reached the maximum number of companies");
      }
  
      // if (companyExist) {
      //   await fs.unlink(file.path);
      //   res.status(400);
      //   throw new Error("Company already exist");
      // }
  
      const newCompany = new CompanyProfile({
        company_name: companyName,
        email,
        phone,
        description,
        user_id: userId,
        logo: file.path,
        street,
        zip,
        city,
        isMultipleBookingAllow,
        isAutoConfirmBookingAllow
      });
      // es6 to es8
  
      const savedCompany = await newCompany.save();
      const resolver = Resolver.create({
        user_id: userId,
        company_id: savedCompany._id,
      });
  
      res
        .status(201)
        .json({ status: 201,data:{
          companyId:savedCompany._id,
          companyName:savedCompany.company_name,
        },
           message: "Company profile created successfully" });
   
  }

  static async getAllCompaniesWithServices(req, res) {
    const companiesWithServices = await CompanyProfile.aggregate([
      {
        $lookup: {
          from: "tbl_services", // The name of the Service collection (should match the collection name in your MongoDB)
          localField: "_id",
          foreignField: "company",
          as: "services",
        },
      },
    ]);

    if (!companiesWithServices) {
      res.status(404);
      throw new Error("No company found");
    }

    return res
      .status(200)
      .json({
        status: 200,
        message: "data fetch successfully",
        data: [companiesWithServices],
      });
  }

  static async getCompanies(req, res) {
    const companies = await CompanyProfile.find({ user_id: req.user });

    if (!companies) {
      res.status(404);
      throw new Error("No company found");
    }

    return res
      .status(200)
      .json({
        status: 200,
        message: "data fetch successfully",
        data: companies,
      });
  }

  // get single company
  static async getCompany(req, res) {
    const companyId = req.params.id;
    try {
      const company = await CompanyProfile.findById({ _id: companyId });
  
      if (!company) {
        res.status(404);
        throw new Error("Company not found");
      }
  
      return res
        .status(200)
        .json({ status: 200, message: "data fetch successfully", data: company });
    } catch (error) {
      res.status(500);
      throw new Error(error);
      
    }
  }

  // update company
  static async updateCompany(req, res) {
    //const companyId = req.params.id;
    const userId = req.user;
    const role = req.role;
    const file = req.file;
    const roleExist = await Role.findById({ _id: role });

    if (roleExist.role !== "admin") {
      res.status(401);
      throw new Error("Unauthorized access");
    }

    const { companyName, street, zip, city, email, phone, description,companyId } = req.body;

    // validate mongoose id
    const validId = mongoose.Types.ObjectId.isValid(companyId);

    if (!validId) {
      const error = new Error("Invalid id");
      res.status(400)
      throw error;
    }
    const objectId = mongoose.Types.ObjectId.createFromHexString(validId);





    if (!req.file) {
      res.status(400);
      throw new Error("Please upload a logo");
    }
    if ( !companyName || !street || !zip || !city || !email || !phone || !description ) {
      res.status(400);
      throw new Error("Please fill all fields");
    }

    const companyExist = await CompanyProfile.findById({ _id: objectId });

    if (!companyExist) {
      res.status(404);
      throw new Error("Company does not exist");
    }

    if (companyExist.user_id.toString() !== userId) {
      res.status(401);
      throw new Error("Unauthorized access");
    }

    await fs.unlink(companyExist.logo);
    companyExist.company_name = companyName;
    companyExist.email = email;
    companyExist.phone = phone;
    companyExist.description = description;
    companyExist.logo = file.path;
    companyExist.street = street;
    companyExist.zip = zip;
    companyExist.city = city;

    await companyExist.save();

    res.status(200).json({ status: 200, message: "Company updated successfully" });
  }





  // delete company
  static async deleteCompany(req, res) {
    const companyId = req.params.id;
    const userId = req.user;
    const role = req.role;

    const roleExist = await Role.findById({ _id: role });

    if (roleExist.role !== "admin") {
      res.status(401);
      throw new Error("Unauthorized access");
    }

    const companyExist = await CompanyProfile.findById({ _id: companyId });

    if (!companyExist) {
      res.status(404);
      throw new Error("Company does not exist");
    }

    if (companyExist.user_id.toString() !== userId) {
      res.status(401);
      throw new Error("Unauthorized access");
    }

    await CompanyProfile.findByIdAndDelete({ _id: companyId });

    res.status(200).json({ status: 200, message: "Company deleted successfully" });
  }

  

  static async addEmployee(req, res) {
    const roleId = req.role;
    const roleIdExist = await Role.findById(roleId);

    if (roleIdExist.role !== "admin") {
      res.status(401);
      throw new Error("Unauthorized access");
    }

    const { email, role, company_id, password, name } = req.body;

    if (!email || !role || !company_id || !password || !name) {
      res.status(400);
      throw new Error("Please fill all fields");
    }
    const roleExist = await Role.findById(role);

    if (!roleExist) {
      res.status(400);
      throw new Error("Role does not exist");
    }
    const lowerCaseEmail = email.toLowerCase();
    const employeeExist = await User.findOne({ email: lowerCaseEmail });
    const companyExist = await CompanyProfile.findById(company_id);
    const generateRandomString = (length) => {
      return crypto
        .randomBytes(length)
        .toString("base64")
        .replace(/\+/g, "0")
        .replace(/\//g, "0")
        .replace(/=+$/, "");
    };
    const token = generateRandomString(20);

    if (!companyExist) {
      res.status(400);
      throw new Error("Company does not exist");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (!employeeExist) {
      const newEmployee = new User({
        email: lowerCaseEmail,
        role,
        password: hashedPassword,
        name,
      });
      const savedEmploye = await newEmployee.save();

      const resolver = await Resolver.create({
        user_id: newEmployee._id,
        company_id,
      });
      await VerificationToken.create({
        token,
        userId: savedEmploye._id,
        expiry: Date.now() + 3600000,
      });

      await sendEmail(name, email, token, "verification");

      return res
        .status(201)
        .json({ status: 201, message: "Employee added successfully" });
    }

    if (employeeExist && employeeExist.isDeleted) {
      employeeExist.isDeleted = false;
      employeeExist.role = role;
      employeeExist.password = hashedPassword;
      employeeExist.name = name;
      const savedEmploye = await employeeExist.save();
      const resolver = await Resolver.findOne({
        user_id: employeeExist._id,
        company_id,
      });
      if (!resolver) {
        await Resolver.create({
          user_id: employeeExist._id,
          company_id,
        });
      }
      const previousUserToken = await VerificationToken.findOne({
        userId: employeeExist._id,
      });

      if (previousUserToken) {
        previousUserToken.token = token;
        previousUserToken.expiry = Date.now() + 3600000;
        await previousUserToken.save();
      } else {
        await VerificationToken.create({
          token,
          userId: employeeExist._id,
          expiry: Date.now() + 3600000,
        });
      }

      await sendEmail(name, email, token, "verification");

      return res
        .status(201)
        .json({ status: 201, message: "Employee added successfully" });
    }

    res.status(400);
    throw new Error("Employee or email already exist");
  }

  
}

export default Company;