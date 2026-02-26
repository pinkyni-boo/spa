const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');
const Feedback = require('../models/Feedback');

exports.seedGalleryAndFeedback = async (req, res) => {
    try {
        // 1. Clean old data if needed (optional)
        // await Gallery.deleteMany({});
        // await Feedback.deleteMany({});

        // 2. Check if data exists
        const countGallery = await Gallery.countDocuments();
        if (countGallery > 0) {
            return res.json({ success: true, message: 'Data already exists' });
        }

        // 3. Seed Gallery (Before/After)
        const sampleResults = [
            {
                title: "Trị mụn viêm sau 1 liệu trình",
                beforeImage: "https://images.unsplash.com/photo-1549488497-21fb9b1424db?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                afterImage: "https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                description: "Khách hàng bị mụn viêm nặng, sau 5 buổi điều trị da đã láng mịn.",
                type: "result",
                isActive: true
            },
            {
                title: "Trẻ hóa da nâng cơ Hifu",
                beforeImage: "https://images.unsplash.com/photo-1558584725-d0d54034870f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                afterImage: "https://images.unsplash.com/photo-1588645012217-0e24ddde5937?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                description: "Cải thiện nếp nhăn vùng mắt và khóe miệng rõ rệt ngay buổi đầu tiên.",
                type: "result",
                isActive: true
            },
             {
                title: "Dịch vụ Gội Đầu Dưỡng Sinh",
                beforeImage: "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                afterImage: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                description: "Tóc suôn mượt, giảm gãy rụng và thư giãn đầu óc.",
                type: "result",
                isActive: true
            }
        ];

        // 4. Seed Gallery (Facility)
        const sampleFacility = [
            {
                title: "Phòng VIP Đôi",
                imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                description: "Không gian riêng tư cho các cặp đôi.",
                type: "facility",
                isActive: true
            },
            {
                title: "Khu Vực Gội Đầu",
                imageUrl: "https://images.unsplash.com/photo-1520624021798-75179c3d4e8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                description: "Yên tĩnh, thư giãn tuyệt đối với nhạc thiền.",
                type: "facility",
                isActive: true
            },
             {
                title: "Sảnh Chờ Sang Trọng",
                imageUrl: "https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                description: "Nơi quý khách thưởng thức trà thảo mộc trước khi làm dịch vụ.",
                type: "facility",
                isActive: true
            }
        ];

        // 5. Seed Reviews
        const sampleReviews = [
             {
                customerName: "Chị Lan Anh",
                customerPhone: "0909123456",
                rating: 5,
                comment: "Dịch vụ quá tuyệt vời! Nhân viên nhiệt tình, tay nghề cao. Mình sẽ quay lại dài dài.",
                status: "approved",
                images: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"]
            },
            {
                customerName: "Anh Tuấn",
                customerPhone: "0912345678",
                rating: 5,
                comment: "Không gian yên tĩnh, gội đầu rất đã. 10 điểm!",
                status: "approved",
                images: []
            },
            {
                customerName: "Bé Mai",
                customerPhone: "0987654321",
                rating: 4,
                comment: "Giá cả hợp lý, nặn mụn hơi đau nhưng sạch. Sẽ ủng hộ shop.",
                status: "approved",
                images: []
            }
        ];

        await Gallery.insertMany([...sampleResults, ...sampleFacility]);
        await Feedback.insertMany(sampleReviews);

        res.json({ success: true, message: 'Seeded sample data successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Seed lại 6 dịch vụ từ services.json (xóa dịch vụ cũ, giữ lại sản phẩm)
exports.seedServices = async (req, res) => {
    try {
        const Service = require('../models/Service');
        const servicesData = require('../data/services.json');

        // Xóa toàn bộ services (type='service' hoặc k có type)
        await Service.deleteMany({ $or: [{ type: 'service' }, { type: { $exists: false } }, { type: null }] });

        // Insert 6 dịch vụ mới
        await Service.insertMany(servicesData);

        res.json({ success: true, message: `Đã seed ${servicesData.length} dịch vụ thành công` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
