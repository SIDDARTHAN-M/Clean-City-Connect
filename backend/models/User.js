const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['civilian', 'worker', 'admin'], default: 'civilian' },

    // Civilian specific
    address: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },

    // Worker specific
    workerId: { type: String },
    assignedZone: { type: String },
    area: { type: String }, // Required for filtering
    isVerified: { type: Boolean, default: false },
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
