const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        employeeId: { type: String, unique: true, sparse: true }, // AUTO-GENERATED
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, unique: true, required: true, lowercase: true },
        phone: { type: String, required: true },
        jobTitle: { type: String, required: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
        role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true }, // Changed to ref for RBAC
        manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

        // Employment details
        joinDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        status: { type: String, enum: ['active', 'inactive', 'on_leave', 'resigned'], default: 'active' },
        employmentType: { type: String, enum: ['full-time', 'part-time', 'contract'], default: 'full-time' },

        // Personal details
        dob: { type: Date },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        pinCode: { type: String },
        country: { type: String },

        // Bank details
        bankAccountNumber: { type: String, select: false },
        ifscCode: { type: String, select: false },
        bankName: { type: String, select: false },
        panNumber: { type: String, select: false },
        aadharNumber: { type: String, select: false },

        // Salary details
        salaryStructure: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure' },
        ctc: { type: Number }, // Cost to company
        baseSalary: { type: Number },

        // Documents
        documents: [{
            name: String,
            fileUrl: String,
            fileType: String,
            uploadDate: Date,
        }],

        // Emergency contact
        emergencyContactName: String,
        emergencyContactPhone: String,
        emergencyContactRelation: String,

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Auto-generate employee ID
employeeSchema.pre('save', async function (next) {
    if (!this.isNew) return next();

    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP-${Date.now()}-${count + 1}`;
    next();
});

module.exports = mongoose.model('Employee', employeeSchema);
