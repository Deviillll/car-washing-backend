import Schedule from "../models/timeTableModel.js"
import CompanyProfile from "../models/companyProfile.js";
import Resolver from "../models/resolver.js";

class ScheduleClass{

static async createSchedule(req, res) {
  const user_id = req.user
  try {
    

    const {startTimes,endTimes,day,durationType,specificDates,companyId} =req.body
    const resolver = await Resolver.findOne({
      user_id,
      company_id: companyId
    });
    if (!resolver) {
      res.status(401);
      throw new Error("Unauthorized access");
    }


    if(!startTimes || !endTimes || !durationType || !companyId){
      res.status(400)
      throw new Error("Please provide all required fields")
    }
    const companyExist = await CompanyProfile.findById(companyId)
    if(!companyExist){
      res.status(404)
      throw new Error("Company does not exist")
    }


    if(startTimes.length !== endTimes.length){
      res.status(400)
      throw new Error("start and end time must be equal")
    }

    for (let i = 0; i < startTimes.length; i++) {
      // Convert strings to numbers
      let startTime = parseInt(startTimes[i], 10);
      let endTime = parseInt(endTimes[i], 10);
  
      if (startTime > endTime) {
          res.status(400);
          throw new Error("Start time cannot be more than end time");
      }
  }
  
    
    if(durationType==="custom" && specificDates.length < 1){
      res.status(400)
      throw new Error("atleast one date is required for custom durationType")
    }
   
    if(durationType==="weekly" && day===""){
      res.status(400)
      throw new Error("Day is required for weekly duration")
    }
    const schedule = new Schedule({
      start :startTimes,
      end :endTimes,
      day,
      duration :durationType,
      dates :specificDates,
      company_id:companyId
    })
    await schedule.save()
    if (!schedule) {
      res.status(400)
      throw new Error("Schedule not created")
    }
    const scheduleWithCompanyName ={...Schedule._doc,companyName:companyExist.company_name} 

    res.status(201).json({
        status: 201,
        message: "Schedule created successfully",
        scheduleWithCompanyName,
    })
    
  } catch (error) {
    throw new Error(error.message)
  }
}
static async getSchedule(req, res) {
  const { companyId } = req.params
  try {

    const companyExist = await CompanyProfile.findById(companyId)
    if(!companyExist){
      res.status(400)
      throw new Error("Company does not exist")
    }
    const schedule = await Schedule.find({ company_id:companyId })
    if (!schedule || schedule.length < 1) {
      res.status(400)
      throw new Error("Schedule not found")
    }


    res.status(200).json({
      status: 200,
      message: "Schedule retrieved successfully",
      schedule,
      companyName:companyExist.company_name
    })
  } catch (error) {
    throw new Error(error.message)
  }
}
 static async updateSchedule(req, res) {
  const user_id = req.user
  const { companyId } = req.params;
  const { scheduleId } = req.query;
  try {
  
    const {startTimes,endTimes,day,durationType,specificDates} =req.body
    console.log(startTimes,endTimes,day,durationType,specificDates,companyId,scheduleId)
    
    if(!startTimes || !endTimes || !durationType || !companyId || !scheduleId){
      res.status(400)
      throw new Error("Please provide all required fields")
    }
    const resolver = await Resolver.findOne({
      user_id,
      company_id: companyId
    });
    if (!resolver) {
      res.status(401);
      throw new Error("Unauthorized access");
    }
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      res.status(400);
      throw new Error("Schedule not found");
    }

    if(durationType==="custom" && specificDates.length < 1){
      res.status(400)
      throw new Error("atleast one date is required for custom durationType")
    }
   
    if(durationType==="weekly" && day===""){
      res.status(400)
      throw new Error("Day is required for weekly duration")
    }
    

    if(startTimes.length !== endTimes.length){
      res.status(400)
      throw new Error("start and end time must be equal")
    }

    for (let i = 0; i < startTimes.length; i++) {
      // Convert strings to numbers
      let startTime = parseInt(startTimes[i], 10);
      let endTime = parseInt(endTimes[i], 10);
  
      if (startTime > endTime) {
          console.log(startTime, endTime);
          res.status(400);
          throw new Error("Start time cannot be more than end time");
      }
  }
  
    schedule.start = startTimes;
    schedule.end = endTimes;
    if (durationType==='custom'&& day ) {
      schedule.day = "";
    }else{
      schedule.day = day;
    }
    if (durationType) {
      schedule.duration = durationType;
    }
    if (specificDates) {
      schedule.dates = specificDates;
    }
   
    await schedule.save();
    res.status(200).json({
      status: 200,
      message: "Schedule updated successfully",
      schedule,
    });

   

  } catch (error) {
    throw new Error(error.message)
  }
}
static async deleteSchedule(req, res) {
  const user_id = req.user
  const { companyId } = req.params;
  const { scheduleId } = req.query;
  try {

    if (!scheduleId  || !companyId) {
      res.status(400);
      throw new Error("Schedule ID or company ID missing");
    }


    const resolver = await Resolver.findOne({
      user_id,
      company_id: companyId
    });
    if (!resolver) {
      res.status(401);
      throw new Error("Unauthorized access");
    }
    const schedule = await Schedule.findByIdAndDelete(scheduleId);
    if (!schedule) {
      res.status(400);
      throw new Error("Schedule not found");
    }
    
    res.status(200).json({
      status: 200,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    throw new Error(error.message)
  }
}

static async getSingleSchedule(req, res) {  
  const { companyId } = req.params;
  const { scheduleId } = req.query;
  
  try {
    if (!scheduleId || !companyId) {
      res.status(400);
      throw new Error("Schedule ID or company ID missing");
    }
    const schedule = await Schedule.findOne({_id:scheduleId,
      company_id: companyId
    });
    if (!schedule) {
      res.status(400);
      throw new Error("Schedule not found");
    }
    res.status(200).json({
      status: 200,
      message: "Schedule retrieved successfully",
      schedule,
    });
  } catch (error) {
    throw new Error(error.message)
  }
}

    

}
export default ScheduleClass;