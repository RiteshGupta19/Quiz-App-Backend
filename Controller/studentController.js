const Student = require('../Model/studentSchema');
const { updateCourseValidation } = require('../validator/courseValidation');
const { createStudentValidation, updateStudentValidation } = require('../validator/studentValidation');



const createStudent = async (req, res) => {
  try {
    // Joi validation
    const { error, value } = createStudentValidation.validate(req.body, { convert: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { userId, name, mobileNo, eMail, courseIds, registeredDate } = value;

    // Check for existing student with same mobile number for this user
    const existingStudentByMobile = await Student.findOne({ mobileNo, userId });
    if (existingStudentByMobile) {
      return res.status(409).json({ message: 'Student with this mobile number already exists.' });
    }

    // Check for existing student with same email for this user
    const existingStudentByEmail = await Student.findOne({ eMail, userId });
    if (existingStudentByEmail) {
      return res.status(409).json({ message: 'Student with this email already exists.' });
    }

    const newStudent = new Student({
      userId,
      name,
      mobileNo,
      eMail,
      courseIds,
      isEnrolled: true,
      registeredDate,
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


//get student by mobile number its for android app
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



const getAllStudents = async (req, res) => {
  try {
    // Get userId from authenticated user (from JWT token middleware)
    const userId = req.user.userId;  // Assuming you have auth middleware that sets req.user
    const students = await Student.find({ userId: userId }) // Filter by userId
      .populate('courseIds', 'courseName') // Populate course names
      .populate('userId', 'name email') // Populate user data if needed
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id)
      .populate('courseIds', 'courseName')
      .populate('userId', 'name email');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error while fetching student' });
  }
};


const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = updateStudentValidation.validate(req.body, { convert: true });
    if (error) {
      console.warn('⚠️ Validation error:', error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, mobileNo, eMail, courseIds, isEnrolled, registeredDate } = value;

    const student = await Student.findById(id);
    if (!student) {
      console.warn('❌ Student not found for ID:', id);
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check mobile number uniqueness if changed
    if (mobileNo !== student.mobileNo) {
      const existingStudentByMobile = await Student.findOne({ mobileNo, userId: student.userId });
      if (existingStudentByMobile && existingStudentByMobile._id.toString() !== id) {
        console.warn('⚠️ Mobile number conflict for:', mobileNo);
        return res.status(409).json({ message: 'Student with this mobile number already exists.' });
      }
    }

    // Check email uniqueness if changed
    if (eMail !== student.eMail) {
      const existingStudentByEmail = await Student.findOne({ eMail, userId: student.userId });
      if (existingStudentByEmail && existingStudentByEmail._id.toString() !== id) {
        console.warn('⚠️ Email conflict for:', eMail);
        return res.status(409).json({ message: 'Student with this email already exists.' });
      }
    }

    const updateData = {
      name,
      mobileNo,
      eMail,
      courseIds,
      isEnrolled
    };

    if (registeredDate) {
      updateData.registeredDate = registeredDate;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('courseIds', 'courseName');

    res.status(200).json({
      message: 'Student updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    console.error('🔥 Error updating student:', error);
    res.status(500).json({ message: 'Server error while updating student' });
  }
};

// Delete Student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete the student
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Student deleted successfully',
      deletedStudentId: id,
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error while deleting student' });
  }
};

// Export all functions
module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentDetails,
  updateStudent,
  deleteStudent,
};

