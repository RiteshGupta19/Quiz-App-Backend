const Student = require('../Model/studentSchema');
const { studentValidation } = require('../validator/studentValidation');


// const createStudent = async (req, res) => {
//   try {
//     const { userId, name, mobileNo, courseIds } = req.body;

//     // Check if required fields are present
//     if (!userId || !name || !mobileNo || !courseIds || !Array.isArray(courseIds)) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Optional: Check for existing student with same mobile number
//     const existingStudent = await Student.findOne({ mobileNo });
//     if (existingStudent) {
//       return res.status(409).json({ message: 'Student with this mobile number already exists.' });
//     }

//     const newStudent = new Student({
//       userId,
//       name,
//       mobileNo,
//       courseIds,
//       isEnrolled: true, // or false depending on logic
//     });

//     await newStudent.save();

//     res.status(201).json({
//       message: 'Student created successfully',
//       student: newStudent,
//     });
//   } catch (error) {
//     console.error('Error creating student:', error);
//     res.status(500).json({ message: 'Server error while creating student' });
//   }
// };



const createStudent = async (req, res) => {
  try {
    // Joi validation
    const { error, value } = studentValidation.validate(req.body, { convert: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { userId, name, mobileNo, courseIds } = value;

    // Allow same student name but prevent same mobile number
    const existingStudent = await Student.findOne({ mobileNo });
    if (existingStudent) {
      return res.status(409).json({ message: 'Student with this mobile number already exists.' });
    }

    const newStudent = new Student({
      userId,
      name,
      mobileNo,
      courseIds,
      isEnrolled: true,
    });

    await newStudent.save();

    res.status(201).json({
      message: 'Student created successfully',
      student: newStudent,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error while creating student' });
  }
};








const getStudentDetails = async (req, res) => {
  try {
    const { mobileNo } = req.params; // assuming userId passed as route param

    if (!mobileNo) {
      return res.status(400).json({ message: 'mobileNo parameter is required' });
    }

    // Find one student for this userId and populate courseIds
    const student = await Student.findOne({ mobileNo })
      .populate('courseIds', 'courseName') // populate only courseName from Course
      .exec();

    if (!student) {
      return res.status(404).json({ message: 'No student found for this userId' });
    }

    res.status(200).json({ student });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Server error while fetching student details' });
  }
};









module.exports = { createStudent, getStudentDetails };
