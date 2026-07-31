const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    clockIn,
    clockOut,
    getAttendance,
    getEmployeeDashboardStats,
} = require('../controllers/employeeController');

/**
 * @swagger
 * /employee:
 *   get:
 *     tags: [Employee]
 *     summary: Get all employees
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, on_leave, resigned] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 10 }
 */
// Specific routes BEFORE generic :id routes
// Attendance routes
/**
 * @swagger
 * /employee/attendance/clock-in:
 *   post:
 *     tags: [Attendance]
 *     summary: Clock in
 *     security: [{ bearerAuth: [] }]
 */
router.post('/attendance/clock-in', protect, clockIn);

/**
 * @swagger
 * /employee/attendance/clock-out:
 *   post:
 *     tags: [Attendance]
 *     summary: Clock out
 *     security: [{ bearerAuth: [] }]
 */
router.post('/attendance/clock-out', protect, clockOut);

/**
 * @swagger
 * /employee/attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: Get attendance records
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: month
 *         schema: { type: number }
 *       - in: query
 *         name: year
 *         schema: { type: number }
 */
router.get('/attendance', protect, getAttendance);

// Dashboard
/**
 * @swagger
 * /employee/dashboard/stats:
 *   get:
 *     tags: [Employee]
 *     summary: Get employee dashboard stats
 *     security: [{ bearerAuth: [] }]
 */
router.get('/dashboard/stats', protect, getEmployeeDashboardStats);

// Generic routes
/**
 * @swagger
 * /employee:
 *   get:
 *     tags: [Employee]
 *     summary: Get all employees
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, on_leave, resigned] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 10 }
 */
router.get('/', protect, authorize('admin', 'employee'), getAllEmployees);

/**
 * @swagger
 * /employee:
 *   post:
 *     tags: [Employee]
 *     summary: Create new employee
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               jobTitle: { type: string }
 *               departmentId: { type: string }
 *               roleId: { type: string }
 */
router.post('/', protect, authorize('admin'), createEmployee);

/**
 * @swagger
 * /employee/{id}:
 *   get:
 *     tags: [Employee]
 *     summary: Get employee by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get('/:id', protect, getEmployeeById);

/**
 * @swagger
 * /employee/{id}:
 *   put:
 *     tags: [Employee]
 *     summary: Update employee
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.put('/:id', protect, authorize('admin'), updateEmployee);

/**
 * @swagger
 * /employee/{id}:
 *   delete:
 *     tags: [Employee]
 *     summary: Delete employee
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete('/:id', protect, authorize('admin'), deleteEmployee);

module.exports = router;
