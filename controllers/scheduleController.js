import Schedule from "../models/timeTableModel.js"

class ScheduleClass{

static async createSchedule(req, res) {
  try {
    const {start,end,day,duration,dates,company_id} =req.body
    if(!start || !end || !duration || !company_id){
      res.status(400)
      throw new Error("Please provide all required fields")
    }

    if(start.length !== end.length){
      res.status(400)
      throw new Error("start and end time must be equal")
    }

    for (let i = 0; i < start.length; i++) {
      // Convert strings to numbers
      let startTime = parseInt(start[i], 10);
      let endTime = parseInt(end[i], 10);
  
      if (startTime > endTime) {
          console.log(startTime, endTime);
          res.status(400);
          throw new Error("Start time cannot be more than end time");
      }
  }
  
    
    if(duration==="custom" && dates.length < 1){
      res.status(400)
      throw new Error("atleast one date is required for custom duration")
    }
   
    if(duration==="weekly" && day===""){
      res.status(400)
      throw new Error("Day is required for weekly duration")
    }
    const schedule = new Schedule({
      start,
      end,
      day,
      duration,
      dates,
      company_id
    })
    await schedule.save()
    if (!schedule) {
      res.status(400)
      throw new Error("Schedule not created")
    }




    res.status(201).json({
        status: 201,
        message: "Schedule created successfully",
        schedule,
    })
    




   
  } catch (error) {
    throw new Error(error.message)
  }
}
static async getSchedule(req, res) {
  const { company_id } = req.body
  try {
    const schedule = await Schedule.find({ company_id })
    if (!schedule) {
      res.status(400)
      throw new Error("Schedule not found")
    }
    res.status(200).json({
      status: 200,
      message: "Schedule retrieved successfully",
      schedule,
    })
  } catch (error) {
    throw new Error(error.message)
  }
}



}
export default ScheduleClass;