const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Role = require('../models/Role');
const Attendance = require('../models/Attendance');
const { sendEmployeeCredentialsEmail } = require('../utils/email');

/**
 * Create Employee
 * POST /api/v1/employee
 */
exports.createEmployee = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, jobTitle, departmentId, roleId, managerId, dob, gender, address, city, state, pinCode, country, salaryStructureId } = req.body;

        // Validate email uniqueness
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return next(new ErrorResponse('Employee with this email already exists', 400));
        }

        // Check if department exists
        const department = await Department.findById(departmentId);
        if (!department) {
            return next(new ErrorResponse('Department not found', 404));
        }

        // Check if role exists
        const role = await Role.findById(roleId);
        if (!role) {
            return next(new ErrorResponse('Role not found', 404));
        }

        // Create User account
        const user = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            password: 'temp123', // Will be changed on first login
            role: 'employee',
            isEmailVerified: false,
            employeeRole: roleId,
        });

        // Create Employee profile
        const employee = await Employee.create({
            userId: user._id,
            firstName,
            lastName,
            email,
            phone,
            jobTitle,
            department: departmentId,
            role: roleId,
            manager: managerId || null,
            dob,
            gender,
            address,
            city,
            state,
            pinCode,
            country,
            salaryStructure: salaryStructureId || null,
        });

        // Link employee to user
        user.employeeProfile = employee._id;
        await user.save();

        // Add employee to department
        await Department.findByIdAndUpdate(departmentId, {
            $push: { employees: employee._id }
        });

        // Send employee credentials email
        try {
            await sendEmployeeCredentialsEmail({
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                jobTitle: employee.jobTitle,
                departmentName: department.name,
                employeeId: employee.employeeId,
            }, 'temp123');
            console.log('[EMPLOYEE EMAIL] Credentials email sent to:', employee.email);
        } catch (emailErr) {
            console.error('[EMPLOYEE EMAIL ERROR]:', emailErr.message);
            // Don't fail the request if email fails, just log it
        }

        const response = {
            success: true,
            message: 'Employee created successfully. Credentials email sent to ' + employee.email,
            employee: {
                ...employee._doc,
                userId: user._id,
            }
        };

        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

/**
 * Get All Employees
 * GET /api/v1/employee
 */
exports.getAllEmployees = async (req, res, next) => {
    try {
        const { departmentId, status, page = 1, limit = 10, search } = req.query;

        let filter = { isActive: true };

        if (departmentId) filter.department = departmentId;
        if (status) filter.status = status;

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const employees = await Employee.find(filter)
            .populate('department')
            .populate('role')
            .populate('manager', 'firstName lastName email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Employee.countDocuments(filter);

        res.json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            employees
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Employee by ID
 * GET /api/v1/employee/:id
 */
exports.getEmployeeById = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('department')
            .populate('role')
            .populate('manager', 'firstName lastName email')
            .populate('salaryStructure');

        if (!employee) {
            return next(new ErrorResponse('Employee not found', 404));
        }

        res.json({ success: true, employee });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Employee
 * PUT /api/v1/employee/:id
 */
exports.updateEmployee = async (req, res, next) => {
    try {
        const { firstName, lastName, jobTitle, departmentId, roleId, managerId, dob, gender, address, city, state, pinCode, country, status } = req.body;

        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return next(new ErrorResponse('Employee not found', 404));
        }

        // Update fields
        if (firstName) employee.firstName = firstName;
        if (lastName) employee.lastName = lastName;
        if (jobTitle) employee.jobTitle = jobTitle;
        if (departmentId) employee.department = departmentId;
        if (roleId) employee.role = roleId;
        if (managerId) employee.manager = managerId;
        if (dob) employee.dob = dob;
        if (gender) employee.gender = gender;
        if (address) employee.address = address;
        if (city) employee.city = city;
        if (state) employee.state = state;
        if (pinCode) employee.pinCode = pinCode;
        if (country) employee.country = country;
        if (status) employee.status = status;

        await employee.save();

        // Update user name
        const user = await User.findById(employee.userId);
        if (user) {
            user.name = `${employee.firstName} ${employee.lastName}`;
            await user.save();
        }

        res.json({ success: true, message: 'Employee updated successfully', employee });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Employee
 * DELETE /api/v1/employee/:id
 */
exports.deleteEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return next(new ErrorResponse('Employee not found', 404));
        }

        employee.isActive = false;
        employee.status = 'resigned';
        employee.endDate = new Date();
        await employee.save();

        // Deactivate user account
        await User.findByIdAndUpdate(employee.userId, { isActive: false });

        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Clock In
 * POST /api/v1/employee/attendance/clock-in
 */
exports.clockIn = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return next(new ErrorResponse('Employee not found', 404));
        }

        const today = new Date().toDateString();
        const todayDate = new Date(today);

        // Check if already clocked in today
        const existingAttendance = await Attendance.findOne({
            employee: employee._id,
            date: todayDate
        });

        if (existingAttendance && existingAttendance.clockInTime) {
            return next(new ErrorResponse('Already clocked in today', 400));
        }

        const attendance = await Attendance.create({
            employee: employee._id,
            date: todayDate,
            clockInTime: new Date(),
            status: 'present'
        });

        res.json({ success: true, message: 'Clocked in successfully', attendance });
    } catch (error) {
        next(error);
    }
};

/**
 * Clock Out
 * POST /api/v1/employee/attendance/clock-out
 */
exports.clockOut = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return next(new ErrorResponse('Employee not found', 404));
        }

        const today = new Date().toDateString();
        const todayDate = new Date(today);

        const attendance = await Attendance.findOne({
            employee: employee._id,
            date: todayDate
        });

        if (!attendance) {
            return next(new ErrorResponse('Clock in not found for today', 404));
        }

        if (attendance.clockOutTime) {
            return next(new ErrorResponse('Already clocked out today', 400));
        }

        attendance.clockOutTime = new Date();

        // Calculate working hours
        const diff = attendance.clockOutTime - attendance.clockInTime;
        attendance.workingHours = diff / (1000 * 60 * 60); // Convert ms to hours

        await attendance.save();

        res.json({ success: true, message: 'Clocked out successfully', attendance });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Attendance Records
 * GET /api/v1/employee/attendance
 */
exports.getAttendance = async (req, res, next) => {
    try {
        const { employeeId, month, year, page = 1, limit = 30 } = req.query;

        let filter = {};

        if (employeeId) {
            filter.employee = employeeId;
        } else {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (employee) filter.employee = employee._id;
        }

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            filter.date = { $gte: startDate, $lte: endDate };
        }

        const skip = (page - 1) * limit;

        const records = await Attendance.find(filter)
            .populate('employee', 'firstName lastName employeeId')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ date: -1 });

        const total = await Attendance.countDocuments(filter);

        res.json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            records
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Employee Dashboard Stats
 * GET /api/v1/employee/dashboard/stats
 */
exports.getEmployeeDashboardStats = async (req, res, next) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return next(new ErrorResponse('Employee not found', 404));
        }

        // Count total employees (for admin)
        const totalEmployees = await Employee.countDocuments({ isActive: true });

        // Department info
        const department = await Department.findById(employee.department);
        const deptEmployees = await Employee.countDocuments({
            department: employee.department,
            isActive: true
        });

        // Today's attendance
        const today = new Date().toDateString();
        const todayDate = new Date(today);
        const todayAttendance = await Attendance.findOne({
            employee: employee._id,
            date: todayDate
        });

        // This month attendance
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const monthlyAttendance = await Attendance.aggregate([
            {
                $match: {
                    employee: mongoose.Types.ObjectId(employee._id),
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalEmployees,
                department: {
                    name: department.name,
                    employees: deptEmployees
                },
                todayAttendance: todayAttendance || null,
                monthlyAttendance: monthlyAttendance || []
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
