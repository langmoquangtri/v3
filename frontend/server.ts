import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

// Firebase configuration matching the user's FireCMS project
const firebaseConfig = {
  apiKey: "AIzaSyAT-B3qaiggBIURgQ2KZNxyoOZF3EfDhbw",
  authDomain: "lang-mo-cms.firebaseapp.com",
  projectId: "lang-mo-cms",
  storageBucket: "lang-mo-cms.firebasestorage.app",
  messagingSenderId: "809136893303",
  appId: "1:809136893303:web:fba4babcac9f18459fc572",
  measurementId: "G-TQ2HFMVPHD",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Mock database for Bia Mộ Đá Mỹ Nghệ
const banners = [
  {
    id: "b1",
    title: "Chế Tác Bia Mộ Đá Tự Nhiên & Granite Cao Cấp",
    subtitle: "Chạm khắc tinh xảo bởi nghệ nhân làng nghề truyền thống. Sử dụng dòng đá tuyển chọn chịu lực chịu nhiệt tốt nhất, khắc chữ sâu mạ vàng 24K trường tồn cùng thời gian.",
    imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
    badge: "Tinh Hoa Làng Nghề Đá Mỹ Nghệ",
    ctaText: "Khám Phá Bộ Sưu Tập",
    ctaLink: "/san-pham"
  },
  {
    id: "b2",
    title: "Lưu Danh Thiên Thu - Trọn Vẹn Đạo Hiếu",
    subtitle: "Cam kết sử dụng đá tự nhiên nguyên khối 100%. Thiết kế chuẩn phong thủy thước Lỗ Ban, chạm khắc rồng phượng, hoa sen tinh tế.",
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1200&auto=format&fit=crop",
    badge: "Phong Thủy Cát Tường",
    ctaText: "Tư Vấn Phong Thủy Miễn Phí",
    ctaLink: "/lien-he"
  }
];

const categories = [
  {
    id: "cat-1",
    name: "Bia Mộ Đá Granite (Hoa Cương)",
    slug: "bia-mo-da-granite",
    description: "Các mẫu bia làm từ đá hoa cương nhập khẩu cao cấp có độ cứng cực cao, bề mặt sáng bóng sang trọng, chống chịu mưa nắng tuyệt đối.",
    imageUrl: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=500&auto=format&fit=crop",
    iconName: "Layers"
  },
  {
    id: "cat-2",
    name: "Bia Mộ Đá Xanh Thanh Hóa",
    slug: "bia-mo-da-xanh-thanh-hoa",
    description: "Sử dụng dòng đá xanh rêu, xanh đen nguyên khối Thanh Hóa cổ kính, dẻo dai, lý tưởng cho điêu khắc rồng phượng, chữ Hán cổ truyền.",
    imageUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=500&auto=format&fit=crop",
    iconName: "Feather"
  },
  {
    id: "cat-3",
    name: "Mộ Đá Mỹ Nghệ Nguyên Khối",
    slug: "mo-da-my-nghe",
    description: "Nhận thiết kế và lắp đặt trọn gói mộ đá tam cấp, mộ tròn, lăng cánh, lăng thờ chung chuẩn phong thủy dòng họ.",
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=500&auto=format&fit=crop",
    iconName: "Castle"
  },
  {
    id: "cat-4",
    name: "Bia Di Tích & Bia Ghi Danh",
    slug: "bia-di-tich-bia-ghi-danh",
    description: "Bia đá khổ lớn phục vụ đình, chùa, đền miếu hoặc đài tưởng niệm anh hùng liệt sĩ. Chữ khắc sâu sâu sắc, chính xác tuyệt đối.",
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=500&auto=format&fit=crop",
    iconName: "Award"
  }
];

const products = [
  {
    id: "p1",
    name: "Bia Mộ Đá Granite Đen Kim Sa Cao Cấp",
    slug: "bia-mo-da-granite-den-kim-sa",
    categorySlug: "bia-mo-da-granite",
    categoryName: "Bia Mộ Đá Granite (Hoa Cương)",
    price: 1350000,
    priceStr: "1.350.000 đ",
    imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
    shortDescription: "Chất liệu đá granite đen kim sa hạt trung sang trọng, bắt sáng lấp lánh dưới ánh nắng mặt trời, chữ khắc sâu sơn mạ vàng 24K cực bền bỉ.",
    description: "Bia mộ đá Granite đen kim sa là sản phẩm được ưa chuộng nhất nhờ vẻ đẹp sang trọng, quý phái. Những hạt kim sa óng ánh ẩn sâu trong lớp đá tạo hiệu ứng lấp lánh trang nghiêm dưới ánh nắng mặt trời. Đá được nhập khẩu chính ngạch, có độ bóng tự nhiên vĩnh cửu, không bị phai màu hay bong tróc dưới tác động khắc nghiệt của thời tiết Việt Nam.",
    specifications: [
      { key: "Kích thước phổ biến", value: "30x40 cm, 35x50 cm, 40x60 cm (Nhận đặt theo kích thước yêu cầu)" },
      { key: "Chất liệu", value: "Đá Granite Đen Kim Sa nhập khẩu" },
      { key: "Công nghệ khắc", value: "Khắc CNC chìm sâu kết hợp đục tay thủ công chi tiết hoa văn" },
      { key: "Chất liệu phủ chữ", value: "Sơn vàng cao cấp chịu nhiệt hoặc mạ vàng lá 24K (theo yêu cầu)" },
      { key: "Thời gian hoàn thành", value: "3 - 5 ngày" }
    ],
    features: [
      "Bề mặt phẳng tuyệt đối, độ bóng gương cực cao dễ dàng lau chùi vệ sinh.",
      "Độ cứng cao, chịu lực nén cực tốt, không nứt nẻ qua thời gian.",
      "Hoa văn viền chữ vạn, rồng chầu nguyệt hoặc hoa sen tùy chọn.",
      "Cam kết bảo hành chữ khắc lên tới 15 năm không phai màu sơn."
    ],
    isFeatured: true,
    rating: 5,
    inStock: true
  },
  {
    id: "p2",
    name: "Bia Mộ Đá Xanh Rêu Khắc Hoa Sen Cổ",
    slug: "bia-mo-da-xanh-reu-hoa-sen-co",
    categorySlug: "bia-mo-da-xanh-thanh-hoa",
    categoryName: "Bia Mộ Đá Xanh Thanh Hóa",
    price: 1850000,
    priceStr: "1.850.000 đ",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
    shortDescription: "Đá xanh rêu Thanh Hóa nguyên khối dẻo dai tuyệt vời, điêu khắc hoa sen chạm nổi mộc mạc cổ kính, mang đậm giá trị tâm linh truyền thống.",
    description: "Sản phẩm được chế tác từ đá xanh rêu tự nhiên khai thác tại mỏ đá vùng núi Yên Định, Thanh Hóa. Chất đá có thớ mịn, dẻo dai chịu mài mòn cao, màu sắc xanh ngọc cổ kính sang trọng. Điểm nổi bật là bông sen được nghệ nhân chạm nổi tinh tế ở chân bia, tượng trưng cho sự thanh cao, an yên, thoát tục của người đã khuất.",
    specifications: [
      { key: "Kích thước tiêu chuẩn", value: "30x40 cm, 40x60 cm" },
      { key: "Độ dày đá", value: "3 cm - 5 cm nguyên khối" },
      { key: "Màu sắc", value: "Xanh rêu tự nhiên (đậm nhạt theo vân đá)" },
      { key: "Điêu khắc", value: "Chữ khắc chìm, hoa sen chạm nổi 3D sâu 1.2 cm" },
      { key: "Phong thủy", value: "Đặc biệt vượng cát cho gia chủ mệnh Mộc và mệnh Hỏa" }
    ],
    features: [
      "Đá tự nhiên nguyên khối 100%, càng để lâu phong trần càng đẹp cổ kính.",
      "Nghệ thuật chạm khắc tinh xảo từ bàn tay các nghệ nhân kỳ cựu.",
      "Màu sắc đá trang nghiêm, hòa quyện với cảnh quan lăng mộ thiên nhiên.",
      "Độ bền vĩnh cửu, không chịu ảnh hưởng bởi axit trong nước mưa."
    ],
    isFeatured: true,
    rating: 4.9,
    inStock: true
  },
  {
    id: "p3",
    name: "Mộ Đá Tam Cấp Granite Đỏ Ruby",
    slug: "mo-da-tam-cap-granite-do-ruby",
    categorySlug: "mo-da-my-nghe",
    categoryName: "Mộ Đá Mỹ Nghệ Nguyên Khối",
    price: 16500000,
    priceStr: "16.500.000 đ",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
    shortDescription: "Mộ đá thiết kế tối giản hiện đại với 3 cấp đá Granite đỏ Ruby Bình Định cực kỳ vững chãi, uy nghiêm, thể hiện lòng hiếu kính vô bờ.",
    description: "Mộ đá tam cấp là lựa chọn hoàn hảo kết hợp giữa xu hướng thiết kế tối giản hiện đại và phong thủy truyền thống vững chãi. Chất liệu đá Granite đỏ Ruby xuất xứ Bình Định mang sắc đỏ đất ấm áp, tượng trưng cho hào khí, sự vượng tộc và trường tồn. Các khối đá được cắt CNC vuông vức, mài bóng mịn và lắp ghép khít khao bằng keo epoxy chuyên dụng siêu liên kết.",
    specifications: [
      { key: "Kích thước đế bia", value: "81x127 cm, 89x147 cm (Chuẩn số đỏ thước Lỗ Ban)" },
      { key: "Kết cấu", value: "3 thớt đá dày 15cm ghép khít hoặc tạc nguyên khối" },
      { key: "Màu sắc", value: "Đỏ Ruby đất kết hợp chỉ đen tuyền" },
      { key: "Thiết kế", value: "Tối giản hiện đại phẳng phiu, bo cạnh tinh tế" },
      { key: "Vận chuyển", value: "Hỗ trợ vận chuyển và thi công lắp đặt toàn quốc" }
    ],
    features: [
      "Màu đỏ ruby đất mang tính ấm, biểu thị sự hưng thịnh cho con cháu dòng họ.",
      "Dễ dàng chăm sóc, lau chùi, không bám rêu mốc mọc hoang.",
      "Bền bỉ tuyệt đối trước gió bão, không sụt lún nhờ móng bê tông đúc vững chãi.",
      "Tích hợp khay cắm hương và lọ hoa đồng bộ bằng đá đỏ sang trọng."
    ],
    isFeatured: true,
    rating: 5,
    inStock: true
  },
  {
    id: "p4",
    name: "Bia Ghi Danh Liệt Sĩ / Bia Quy Công Đức Đá Trắng",
    slug: "bia-ghi-danh-liet-si-da-trang",
    categorySlug: "bia-di-tich-bia-ghi-danh",
    categoryName: "Bia Di Tích & Bia Ghi Danh",
    price: 8500000,
    priceStr: "8.500.000 đ",
    imageUrl: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=600&auto=format&fit=crop",
    shortDescription: "Bia đá trắng mỹ nghệ Non Nước đục đẽo rồng chầu ngậm ngọc ở trán bia, chân đế rùa đá vững vàng, khắc tên công đức đền chùa danh môn.",
    description: "Chuyên phục vụ các công trình tâm linh công cộng, đền chùa, từ đường dòng họ. Tác phẩm bia đá trắng mỹ nghệ sử dụng phôi đá cẩm thạch trắng Non Nước nguyên khối thanh khiết, tạc họa hoa văn rồng uốn lượn rực rỡ và đặt uy nghiêm trên lưng rùa đá. Trán bia chạm trổ tinh vi, viền lá đề cách điệu giao hòa cổ kính và hiện đại.",
    specifications: [
      { key: "Chiều cao bia", value: "120 cm - 180 cm" },
      { key: "Chiều ngang", value: "70 cm - 90 cm" },
      { key: "Đế rùa đá", value: "Chạm khắc rùa sinh động dầy 30 cm nguyên khối" },
      { key: "Chữ viết", value: "Khắc máy CNC độ nét siêu nhỏ, sơn nhũ vàng ròng hoặc sơn đen" },
      { key: "Xuất xứ", value: "Làng đá mỹ nghệ Non Nước, Đà Nẵng" }
    ],
    features: [
      "Thích hợp ghi danh công đức dòng họ, danh sách liệt sĩ, lịch sử đền chùa cổ tích.",
      "Đá trắng tự nhiên tuyển chọn không bị loang lổ vết ố vàng.",
      "Sản phẩm được nghệ nhân điêu khắc bằng kỹ nghệ truyền thừa độc bản."
    ],
    isFeatured: false,
    rating: 4.8,
    inStock: true
  },
  {
    id: "p5",
    name: "Bia Mộ Công Giáo Đá Granite Đen Ấn Độ",
    slug: "bia-mo-cong-giao-granite-an-do",
    categorySlug: "bia-mo-da-granite",
    categoryName: "Bia Mộ Đá Granite (Hoa Cương)",
    price: 1500000,
    priceStr: "1.500.000 đ",
    imageUrl: "https://images.unsplash.com/photo-1595121406822-be1b8a53e41c?q=80&w=600&auto=format&fit=crop",
    shortDescription: "Thiết kế dành riêng cho đồng bào Công giáo với cây Thánh Giá khắc chìm tinh tế, hình ảnh Đức Mẹ hoặc Chúa Kitô sắc nét, đá đen bóng bẩy.",
    description: "Bia mộ công giáo được thiết kế trang nghiêm với biểu tượng Thánh Giá linh thiêng, cành ô liu hòa bình hoặc kinh thánh. Sử dụng đá Granite nhập khẩu từ Ấn Độ có màu đen tuyền tuyệt đối, tạo nên phông nền tương phản cực tốt giúp chân dung người đã khuất và các dòng chữ khắc rõ ràng, chân thực nhất.",
    specifications: [
      { key: "Kích thước thông dụng", value: "30x40 cm, 40x60 cm" },
      { key: "Biểu tượng", value: "Thánh giá, cuốn kinh thánh, dây nho, thiên thần chầu" },
      { key: "Phương thức", value: "Khắc laser chân dung (nếu có) + khắc đục mạ vàng chữ" },
      { key: "Độ bền", value: "Kháng axit, chịu nhiệt độ đóng băng và nắng nóng cực hạn" }
    ],
    features: [
      "Thiết kế thanh lịch, thể hiện đức tin thiêng liêng cao cả.",
      "Ảnh chân dung được khắc bằng máy bắn laser thế hệ mới cực sắc nét như ảnh chụp.",
      "Phôi đá tuyển chọn kỹ lưỡng, không nứt rạn ngầm."
    ],
    isFeatured: false,
    rating: 4.9,
    inStock: true
  },
  {
    id: "p6",
    name: "Bia Mộ Tổ Khảo Đá Xanh Đen Chạm Chỉ Cổ",
    slug: "bia-mo-to-khao-da-xanh-den",
    categorySlug: "bia-mo-da-xanh-thanh-hoa",
    categoryName: "Bia Mộ Đá Xanh Thanh Hóa",
    price: 2100000,
    priceStr: "2.100.000 đ",
    imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=600&auto=format&fit=crop",
    shortDescription: "Khắc chữ Hán - Nôm và Quốc ngữ song hành sắc nét. Viền mây tía cổ chạm lượn tinh xảo, chất đá xanh đen nguyên thớ nguyên bản vô cùng uy nghiêm.",
    description: "Dành riêng cho bia mộ tổ phụ, tổ mẫu hay tiên tổ trong dòng tộc. Tác phẩm mang phong cách truyền thống tuyệt đối với viền mây uốn quanh như tía nắng triều dâng. Chất liệu đá xanh đen Thanh Hóa tạo cảm giác tôn kính sâu thẳm, trầm mặc, gắn kết linh khí đất trời.",
    specifications: [
      { key: "Kích thước", value: "40x60 cm, 50x70 cm" },
      { key: "Ngôn ngữ", value: "Hỗ trợ thiết kế câu đối chữ Hán phồn thể, quốc ngữ thư pháp" },
      { key: "Điêu khắc", value: "Chạm khắc âm bản thủ công, sơn đỏ đất tía hoặc nhũ vàng nhạt" },
      { key: "Họa tiết", value: "Ngũ phúc lâm môn, mây cổ sơn thủy, sen đầm phong thủy" }
    ],
    features: [
      "Phù hợp lắp đặt tại lăng mộ chung, nhà thờ tổ, nhà từ đường.",
      "Được tư vấn bởi chuyên gia văn hóa lịch sử về chữ Hán - Nôm thờ phụng.",
      "Bảo hành trọn đời vết nứt đá tự nhiên."
    ],
    isFeatured: true,
    rating: 5,
    inStock: true
  }
];

const projects = [
  {
    id: "proj-1",
    name: "Phục Dựng Bia Đá Di Tích Đền thờ Quốc Mẫu",
    slug: "phuc-dung-bia-da-di-tich-den-tho-quoc-mau",
    location: "Chí Linh, Hải Dương",
    year: "2025",
    material: "Đá xanh Thanh Hóa khối cổ dầy 15cm",
    shortDescription: "Dự án trùng tu tôn tạo bia ghi danh lịch sử đền thờ Quốc Mẫu bằng đá xanh Thanh Hóa nguyên khối cao 2.2m.",
    description: "Đội ngũ nghệ nhân của chúng tôi vinh dự được lựa chọn là đơn vị phục dựng tấm bia đá lịch sử ghi danh công đức tại di tích quốc gia. Công trình đòi hỏi sự chính xác tối đa về các nét chữ Nôm cổ, viền mây tía lượn sóng thời Lê Trung Hưng. Chúng tôi tiến hành khai thác thỏi đá xanh dẻo thớ mịn nhất từ mỏ Yên Định, tạc thủ công hoàn toàn rùa đá chầu và thân bia dày dặn trong vòng 45 ngày liên tục.",
    imageUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=800&auto=format&fit=crop",
    scope: [
      "Khảo sát, đo đạc phác thảo bản vẽ tỷ lệ 1:1 dựa trên sắc phong cổ còn lưu lại.",
      "Khai thác tạc thô rùa đá bệ đỡ nguyên khối nặng 2.5 tấn.",
      "Chạm nổi rồng chầu mặt nguyệt và hoa văn mây tía quanh bờ viền bia.",
      "Điêu khắc chữ Nôm sắc nét sâu 8mm, phủ sơn bảo ôn đen mộc mạc cổ kính.",
      "Vận chuyển đường núi hiểm trở, lắp đặt an toàn tuyệt đối tại hậu cung di tích."
    ]
  },
  {
    id: "proj-2",
    name: "Quy Hoạch Lăng Mộ Gia Tộc Nguyễn Văn",
    slug: "quy-hoach-lang-mo-gia-toc-nguyen-van",
    location: "Yên Thành, Nghệ An",
    year: "2026",
    material: "Đá Granite Đỏ Ruby kết hợp Đen Kim Sa",
    shortDescription: "Thiết kế và lắp dựng đồng bộ lăng mộ gia tộc dòng họ Nguyễn Văn rộng 120m2 chuẩn phong thủy tam hợp cát.",
    description: "Công trình lăng mộ gia đình quy mô lớn kết hợp hài hòa giữa chất liệu truyền thống và phong cách bài trí hiện đại tối giản. Trung tâm lăng là lăng thờ cánh lớn chạm rồng chầu, xung quanh xếp đặt 8 ngôi mộ tam cấp đá đỏ ruby tạo cảm giác ấm cúng, đại cát đại lợi cho gia tộc. Toàn bộ khuôn viên bao quanh bởi lan can đá xanh kiên cố chạm tích Tùng Cúc Trúc Mai thanh tao.",
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop",
    scope: [
      "Tư vấn thực địa, định hướng hướng mộ và phân khu theo ngũ hành sinh khắc.",
      "Bản vẽ 3D quy hoạch tổng thể chi tiết từng phân khu mộ phần, cổng đá, cuốn thư.",
      "Gia công chế tác 8 mộ đá tam cấp đỏ Ruby nguyên khối sáng bóng vĩnh cửu.",
      "Tạc khắc đôi rồng đá chầu cổng và cuốn thư đá xanh phong thủy chấn trạch.",
      "Hoàn thiện lắp đặt trong vòng 20 ngày trước tiết Thanh Minh."
    ]
  },
  {
    id: "proj-3",
    name: "Bia Tưởng Niệm Liệt Sĩ Xã Quảng Xương",
    slug: "bia-tuong-niem-liet-si-xa-quang-xuong",
    location: "Quảng Xương, Thanh Hóa",
    year: "2025",
    material: "Đá Granite Đen Tây Ban Nha nhập khẩu",
    shortDescription: "Bia tưởng niệm anh hùng liệt sĩ cao 3.5m khắc chìm nhũ vàng ròng sắc sảo danh sách 480 anh hùng liệt sĩ.",
    description: "Nhân dịp kỷ niệm ngày thương binh liệt sĩ, Ủy ban nhân dân xã đã giao phó trách nhiệm thi công đài bia tưởng niệm mới tại nghĩa trang liệt sĩ quê nhà. Sử dụng chất liệu đá Granite cao cấp nhập khẩu Tây Ban Nha có cấu trúc vô cùng bền vững, mặt bia phẳng lì như gương soi. Công nghệ khắc laser mài sâu giúp lưu giữ trọn vẹn từng nét chữ tên tuổi liệt sĩ không lo phai nhạt dưới nắng mưa khắc nghiệt miền Trung.",
    imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop",
    scope: [
      "Lập quy trình rà soát đối chiếu danh sách liệt sĩ trùng khớp tuyệt đối.",
      "Thi công phần thô bệ đài tưởng niệm bê tông cốt thép ốp đá granite.",
      "Ghép nối 3 tấm bia đá granite khổ lớn mài bóng cạnh tinh xảo.",
      "Điêu khắc chữ Quốc ngữ sắc nét kết hợp biểu tượng Ngôi Sao Vàng Tổ Quốc thiêng liêng.",
      "Sử dụng sơn nhũ vàng 24K đặc chủng của Nhật Bản, chống chịu cực tím và axit."
    ]
  }
];

const posts = [
  {
    id: "post-1",
    name: "Chọn Kích Thước Bia Mộ Chuẩn Phong Thủy Thước Lỗ Ban",
    slug: "chon-kich-thuoc-bia-mo-chuan-phong-thuy",
    date: "25 Tháng 05, 2026",
    author: "Nghệ nhân Nguyễn Tiến Đạt",
    readTime: "6 phút đọc",
    shortDescription: "Kích thước bia mộ không chỉ quyết định thẩm mỹ mà còn ảnh hưởng sâu sắc tới phong thủy âm trạch gia tộc. Xem ngay các số đo cát tường mang lại bình an.",
    content: `Trong phong thủy âm trạch, ngôi mộ chính là ngôi nhà vĩnh hằng của người đã khuất. Việc xây dựng bia mộ với kích thước chuẩn phong thủy giúp linh hồn người đã khuất được an nghỉ, đồng thời che chở, phù hộ cho con cháu đời sau được hanh thông tài lộc, gia đạo hòa thuận.

Để đo kích thước bia mộ cát tường, các nghệ nhân đá mỹ nghệ luôn sử dụng Thước Lỗ Ban 38.8 cm (còn gọi là thước Lỗ Ban âm trạch). Dưới đây là các cung số đẹp thường dùng:

1. Kích thước bia mộ phổ biến:
- 30 x 40 cm (Cung Tiến Bảo, Thêm Đinh): Thích hợp cho các bia mộ đơn, mộ hỏa táng, mộ cải táng nhỏ gọn.
- 35 x 50 cm (Cung Đỗ Đạt, Quý Tử): Kích thước cân đối nhất cho mộ xây xi măng hoặc mộ đá tam cấp thông dụng.
- 40 x 60 cm (Cung Lợi Ích, Phú Quý): Thích hợp làm bia mộ tổ, mộ dòng họ cần ghi nhiều thông tin, câu đối chữ Hán.

2. Những lưu ý khi sắp xếp thông tin trên bia mộ:
Sự hài hòa giữa phần chữ viết và các hoa văn bao quanh (như viền sen, viền mây hoặc rồng chầu) là cực kỳ quan trọng. Trán bia nên có biểu tượng tôn giáo phù hợp (như bông sen cho Phật tử, Thánh Giá cho người Công giáo). Chữ viết phải rõ ràng, ngắn gọn nhưng đầy đủ họ tên, ngày tháng năm sinh/tử, hưởng thọ, quê quán và tên các con cháu lập bia.

Đội ngũ Bia Mộ Đá Mỹ Nghệ của chúng tôi luôn hỗ trợ thiết kế miễn phí bản vẽ 2D chuẩn phong thủy cho gia chủ trước khi tiến hành đục khắc thực tế để đảm bảo tránh tối đa các cung số hung hiểm.`,
    imageUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "post-2",
    name: "Nên Chọn Đá Granite Hay Đá Xanh Làm Bia Mộ Gia Đình?",
    slug: "nen-chon-da-granite-hay-da-xanh-lam-bia-mo",
    date: "12 Tháng 06, 2026",
    author: "Kỹ sư vật liệu Trần Thanh Hải",
    readTime: "8 phút đọc",
    shortDescription: "Đá Granite bóng bẩy chịu mòn cực tốt hay đá xanh Thanh Hóa mộc mạc cổ kính bền bỉ? Cùng so sánh chi tiết ưu nhược điểm của hai loại đá quốc dân này.",
    content: `Khi xây cất hay sửa sang phần mộ cho ông bà tổ tiên, câu hỏi khiến nhiều gia chủ băn khoăn nhất chính là chọn chất liệu đá nào làm bia để vừa bền vững vĩnh cửu vừa mang tính thẩm mỹ tôn nghiêm. Hiện nay, hai chất liệu thống trị thị trường là Đá Granite (hoa cương) và Đá Xanh tự nhiên (xanh rêu, xanh đen Thanh Hóa).

Hãy cùng chúng tôi cân nhắc chi tiết dựa trên 4 tiêu chí cốt lõi:

1. Độ bền vật lý và hóa học:
- Đá Granite: Có độ cứng tuyệt đối (chỉ đứng sau kim cương). Kháng axit cực tốt, không thấm nước, không bị rêu mốc bám dính. Tuổi thọ đá granite gần như là vĩnh cửu dưới mọi kiểu khí hậu thời tiết.
- Đá Xanh Thanh Hóa: Thớ đá dẻo dai hơn nên không giòn nứt. Tuy có độ hút nước nhẹ hơn granite nhưng khả năng chịu nhiệt rất tốt. Qua thời gian hàng chục năm, đá xanh sẽ lên màu phong trần rất cổ kính, trầm mặc.

2. Tính nghệ thuật và điêu khắc:
- Đá Granite: Do quá cứng nên không thể chạm nổi hoa văn sâu hay đục đẽo rồng bay phượng múa quá uốn lượn. Đá granite chủ yếu ứng dụng cho phong cách tối giản hiện đại phẳng phiu sang trọng, khắc chìm chữ sắc sảo bằng máy CNC hoặc tia laser.
- Đá Xanh: Là "vua điêu khắc". Thớ đá dẻo dai giúp nghệ nhân dễ dàng đục nổi hoa văn sâu 3D như hình hoa sen, rồng chầu nguyệt, mây bay tía, câu đối cổ lồi nổi sắc nét. Thích hợp cho gia đình muốn bia mộ mang vẻ đẹp nghệ thuật truyền thống xưa.

3. Giá thành sản xuất:
Thông thường, bia mộ đá Granite đen kim sa hay đen Ấn Độ có giá mềm hơn đôi chút so với đá xanh Thanh Hóa đục tay phức tạp do tiết kiệm được công lao động thủ công của nghệ nhân lành nghề.

Kết luận: Nếu bạn yêu thích nét đẹp hiện đại, sạch sẽ, láng bóng như gương và dễ lau chùi, hãy chọn Đá Granite. Còn nếu bạn mong muốn lăng mộ mang nét uy nghiêm, cổ kính, mộc mạc thấm đẫm văn hóa phương Đông truyền thống, hãy chọn Đá Xanh Thanh Hóa nguyên khối.`,
    imageUrl: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "post-3",
    name: "Ý Nghĩa Hoa Văn Chạm Khắc Trên Bia Mộ Đá Phương Đông",
    slug: "y-nghia-hoa-van-cham-khac-bia-mo-da",
    date: "03 Tháng 07, 2026",
    author: "Nghiên cứu văn hóa Lê Văn Sơn",
    readTime: "5 phút đọc",
    shortDescription: "Hoa sen, rồng chầu mặt nguyệt, chữ vạn hay tùng cúc trúc mai chạm trên bia mộ mang những thông điệp tâm linh gì? Khám phá ẩn ý sâu xa sau những nét đục.",
    content: `Những hoa văn viền quanh bia mộ không đơn thuần là chi tiết trang trí thẩm mỹ mà mỗi nét chạm khắc đều mang một ý nghĩa nhân văn, một thông điệp tâm linh vô cùng sâu sắc gửi gắm tới tổ tiên đã khuất và răn dạy con cháu đời sau.

Hãy cùng giải mã các mẫu họa tiết phổ biến nhất trong mỹ nghệ đá:

1. Hoa sen đầm - Sự thuần khiết và giải thoát:
Hoa sen là biểu tượng thiêng liêng nhất trong cả Phật giáo và đời sống dân gian Việt Nam. Khắc họa hoa sen nơi chân bia tượng trưng cho sự thức tỉnh, gột rửa bụi trần, giúp linh hồn người đã khuất được nhẹ nhàng siêu sinh về miền cực lạc an yên. Hoa sen cũng mang lại cảm giác hiền hòa, ấm áp xoa dịu nỗi đau mất mát của người sống.

2. Rồng chầu mặt nguyệt - Uy nghiêm và thịnh vượng:
Rồng là linh vật đứng đầu Tứ Linh, đại diện cho vương quyền, sức mạnh tối thượng và sự bảo hộ tâm linh mạnh mẽ. Hình ảnh đôi rồng uốn mình chầu vào vầng mặt trăng biểu thị sự giao hòa của âm dương đối cực, mang lại linh khí trấn giữ phần mộ tránh xa tà ma ngoại đạo, đồng thời cầu mong sự vinh hiển phú quý lâu dài cho con cháu gia tộc.

3. Bộ Tứ Quý (Tùng - Cúc - Trúc - Mai):
Tượng trưng cho bốn mùa xuân hạ thu đông luân chuyển hòa hợp của vũ trụ. Đồng thời, bộ hoa văn này ca ngợi khí tiết kiên cường, tấm lòng thanh cao cốt cách của người đã khuất lúc sinh thời, cũng như lời chúc phúc con cháu hưng vượng quanh năm bốn tiết.

Hãy liên hệ với chúng tôi để nhận trọn bộ thư viện mẫu hoa văn độc bản được số hóa sắc nét, sẵn sàng chế tác cho phần mộ người thân của bạn một cách trang nghiêm nhất.`,
    imageUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=600&auto=format&fit=crop"
  }
];

const contactMessages: any[] = [];

// Firestore Fetching & Mapping Helpers
async function fetchBanners() {
  try {
    const querySnapshot = await getDocs(collection(db, "banners"));
    if (querySnapshot.empty) return banners;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        subtitle: data.subtitle || "",
        imageUrl: data.image || "",
        mobileImageUrl: data.mobile_image || "",
        badge: data.position === "home_hero" ? "Tinh Hoa Làng Nghề Đá Mỹ Nghệ" : undefined,
        ctaText: data.button_text || "Khám Phá Bộ Sưu Tập",
        ctaLink: data.link || "/san-pham",
        active: data.active !== false,
        sort_order: data.sort_order || 0
      };
    });
    const activeBanners = docs.filter(b => b.active);
    activeBanners.sort((a, b) => a.sort_order - b.sort_order);
    return activeBanners.length > 0 ? activeBanners : banners;
  } catch (error) {
    console.error("Error fetching banners from Firestore:", error);
    return banners;
  }
}

async function fetchCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    if (querySnapshot.empty) return categories;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      let iconName = "Layers";
      if (data.slug === "bia-mo-da-xanh-thanh-hoa") iconName = "Feather";
      if (data.slug === "mo-da-my-nghe") iconName = "Castle";
      if (data.slug === "bia-di-tich-bia-ghi-danh") iconName = "Award";
      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        imageUrl: data.image || "",
        iconName,
        active: data.active !== false,
        sort_order: data.sort_order || 0
      };
    });
    const activeCategories = docs.filter(c => c.active);
    activeCategories.sort((a, b) => a.sort_order - b.sort_order);
    return activeCategories.length > 0 ? activeCategories : categories;
  } catch (error) {
    console.error("Error fetching categories from Firestore:", error);
    return categories;
  }
}

async function fetchProducts(categoriesList: any[]) {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    if (querySnapshot.empty) return products;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      let catSlug = "bia-mo-da-granite";
      let catName = "Bia Mộ Đá Granite (Hoa Cương)";
      
      if (data.category && typeof data.category === "object") {
        const catId = data.category.id;
        const matchingCat = categoriesList.find(c => c.id === catId || c.slug === catId);
        if (matchingCat) {
          catSlug = matchingCat.slug;
          catName = matchingCat.name;
        }
      }

      const price = data.reference_price || 0;
      const priceStr = price > 0 ? `${price.toLocaleString("vi-VN")} đ` : "Liên hệ báo giá";

      const specs = [
        { key: "Kích thước phổ biến", value: data.dimensions || "Theo kích thước yêu cầu" },
        { key: "Chất liệu", value: data.material || "Đá tự nhiên nguyên khối" },
        { key: "Công nghệ khắc", value: "Khắc CNC chìm sâu kết hợp đục tay thủ công chi tiết hoa văn" },
        { key: "Chất liệu phủ chữ", value: "Sơn vàng cao cấp chịu nhiệt hoặc mạ vàng lá 24K (theo yêu cầu)" },
        { key: "Thời gian hoàn thành", value: "3 - 5 ngày" }
      ];

      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || "",
        categorySlug: catSlug,
        categoryName: catName,
        price: price,
        priceStr: priceStr,
        imageUrl: data.main_image || "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
        shortDescription: data.short_description || "",
        description: data.content || "",
        specifications: specs,
        features: [
          "Bề mặt phẳng tuyệt đối, độ bóng gương cực cao dễ dàng lau chùi vệ sinh.",
          "Độ cứng cao, chịu lực nén cực tốt, không nứt nẻ qua thời gian.",
          "Hoa văn viền chữ vạn, rồng chầu nguyệt hoặc hoa sen tùy chọn.",
          "Cam kết bảo hành chữ khắc lên tới 15 năm không phai màu sơn."
        ],
        isFeatured: data.featured === true,
        rating: 5,
        inStock: data.status === "published",
        sort_order: data.sort_order || 0
      };
    });
    
    const publishedProducts = docs.filter(p => p.inStock);
    publishedProducts.sort((a, b) => a.sort_order - b.sort_order);
    return publishedProducts.length > 0 ? publishedProducts : products;
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    return products;
  }
}

async function fetchProjects() {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    if (querySnapshot.empty) return projects;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const completedDate = data.completed_date;
      let year = "2026";
      if (completedDate) {
        if (completedDate.seconds) {
          year = new Date(completedDate.seconds * 1000).getFullYear().toString();
        } else if (completedDate instanceof Date) {
          year = completedDate.getFullYear().toString();
        } else {
          year = new Date(completedDate).getFullYear().toString();
        }
      }
      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || "",
        location: data.location || "Toàn quốc",
        year,
        material: data.material || "Đá tự nhiên",
        shortDescription: data.short_description || "",
        description: data.content || "",
        imageUrl: data.main_image || "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=800&auto=format&fit=crop",
        scope: [
          "Khảo sát, đo đạc phác thảo bản vẽ tỷ lệ 1:1 dựa trên yêu cầu.",
          "Gia công thô cắt phôi đá tạc móng vững chắc.",
          "Chạm khắc nổi rồng phượng nguyệt hoa sen rực rỡ nghệ thuật.",
          "Điêu khắc chữ mạ vàng bảo vệ vĩnh cửu chống rêu phong thời tiết.",
          "Vận chuyển và hỗ trợ hoàn thiện lắp đặt tận nơi toàn quốc."
        ],
        status: data.status || "draft",
        sort_order: data.sort_order || 0
      };
    });
    const publishedProjects = docs.filter(p => p.status === "published");
    publishedProjects.sort((a, b) => a.sort_order - b.sort_order);
    return publishedProjects.length > 0 ? publishedProjects : projects;
  } catch (error) {
    console.error("Error fetching projects from Firestore:", error);
    return projects;
  }
}

async function fetchPosts() {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"));
    if (querySnapshot.empty) return posts;
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const content = data.content || "";
      const wordCount = content.split(/\s+/).length;
      const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} phút đọc`;
      
      const publishedDateVal = data.published_at;
      let publishedDate = "Gần đây";
      if (publishedDateVal) {
        let d: Date;
        if (publishedDateVal.seconds) {
          d = new Date(publishedDateVal.seconds * 1000);
        } else if (publishedDateVal instanceof Date) {
          d = publishedDateVal;
        } else {
          d = new Date(publishedDateVal);
        }
        publishedDate = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
      }

      return {
        id: doc.id,
        name: data.title || "",
        slug: data.slug || "",
        date: publishedDate,
        author: data.author || "Nghệ nhân LĂNG MỘ ĐÁ QUẢNG TRỊ",
        readTime: readTime,
        shortDescription: data.excerpt || "",
        content: content,
        imageUrl: data.cover_image || "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600&auto=format&fit=crop",
        status: data.status || "draft"
      };
    });
    const publishedPosts = docs.filter(p => p.status === "published");
    return publishedPosts.length > 0 ? publishedPosts : posts;
  } catch (error) {
    console.error("Error fetching posts from Firestore:", error);
    return posts;
  }
}

// Initialize Express Server
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Endpoints

// 1. GET /api/homepage
app.get("/api/homepage", async (req, res) => {
  try {
    const [bannersData, categoriesData, projectsData, postsData] = await Promise.all([
      fetchBanners(),
      fetchCategories(),
      fetchProjects(),
      fetchPosts()
    ]);
    const productsData = await fetchProducts(categoriesData);
    
    res.json({
      banners: bannersData,
      categories: categoriesData,
      products: productsData.filter(p => p.isFeatured),
      projects: projectsData,
      posts: postsData.slice(0, 3)
    });
  } catch (err) {
    console.error("Error generating homepage data:", err);
    res.status(500).json({ error: "Không thể lấy dữ liệu trang chủ" });
  }
});

// 2. GET /api/products
app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    const categoriesData = await fetchCategories();
    const productsData = await fetchProducts(categoriesData);
    let filteredProducts = [...productsData];

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.categorySlug === category);
    }

    if (search) {
      const searchStr = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchStr) || 
        p.shortDescription.toLowerCase().includes(searchStr) ||
        p.categoryName.toLowerCase().includes(searchStr)
      );
    }

    res.json(filteredProducts);
  } catch (err) {
    res.status(500).json({ error: "Không thể tải danh sách sản phẩm" });
  }
});

// 3. GET /api/products/:slug
app.get("/api/products/:slug", async (req, res) => {
  try {
    const categoriesData = await fetchCategories();
    const productsData = await fetchProducts(categoriesData);
    const product = productsData.find(p => p.slug === req.params.slug);
    if (!product) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Không thể tải chi tiết sản phẩm" });
  }
});

// 4. GET /api/categories
app.get("/api/categories", async (req, res) => {
  try {
    const categoriesData = await fetchCategories();
    res.json(categoriesData);
  } catch (err) {
    res.status(500).json({ error: "Không thể tải danh mục" });
  }
});

// 5. GET /api/categories/:slug
app.get("/api/categories/:slug", async (req, res) => {
  try {
    const categoriesData = await fetchCategories();
    const category = categoriesData.find(c => c.slug === req.params.slug);
    if (!category) {
      return res.status(404).json({ error: "Danh mục không tồn tại" });
    }
    const productsData = await fetchProducts(categoriesData);
    const categoryProducts = productsData.filter(p => p.categorySlug === req.params.slug);
    res.json({
      category,
      products: categoryProducts
    });
  } catch (err) {
    res.status(500).json({ error: "Không thể tải danh mục chi tiết" });
  }
});

// 6. GET /api/projects
app.get("/api/projects", async (req, res) => {
  try {
    const projectsData = await fetchProjects();
    res.json(projectsData);
  } catch (err) {
    res.status(500).json({ error: "Không thể tải danh sách dự án" });
  }
});

// 7. GET /api/projects/:slug
app.get("/api/projects/:slug", async (req, res) => {
  try {
    const projectsData = await fetchProjects();
    const project = projectsData.find(p => p.slug === req.params.slug);
    if (!project) {
      return res.status(404).json({ error: "Dự án không tồn tại" });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Không thể tải chi tiết dự án" });
  }
});

// 8. GET /api/posts
app.get("/api/posts", async (req, res) => {
  try {
    const postsData = await fetchPosts();
    res.json(postsData);
  } catch (err) {
    res.status(500).json({ error: "Không thể tải danh sách bài viết" });
  }
});

// 9. GET /api/posts/:slug
app.get("/api/posts/:slug", async (req, res) => {
  try {
    const postsData = await fetchPosts();
    const post = postsData.find(p => p.slug === req.params.slug);
    if (!post) {
      return res.status(404).json({ error: "Bài viết không tồn tại" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Không thể tải bài viết" });
  }
});

// 10. POST /api/contact
app.post("/api/contact", async (req, res) => {
  const { name, phone, email, productSlug, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Vui lòng điền họ tên và số điện thoại." });
  }
  
  const newMessage = {
    id: `msg-${Date.now()}`,
    name,
    phone,
    email: email || "",
    productSlug: productSlug || "",
    message: message || "",
    createdAt: new Date().toISOString()
  };
  contactMessages.push(newMessage);
  console.log("New contact message received:", newMessage);

  try {
    // Optionally log to Firestore contacts collection too!
    await addDoc(collection(db, "contact_messages"), {
      name,
      phone,
      email: email || "",
      product_slug: productSlug || "",
      message: message || "",
      created_at: new Date()
    });
  } catch (fsErr) {
    console.error("Failed to back up contact message to Firestore:", fsErr);
  }

  res.json({ 
    success: true, 
    message: "Gửi lời nhắn thành công! Đội ngũ nghệ nhân Bia Mộ Đá Mỹ Nghệ sẽ liên hệ với quý khách trong vòng 1 giờ làm việc." 
  });
});


// Serve Frontend using Vite Middleware in Dev, or Express Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    let distPath = path.join(process.cwd(), "dist");
    if (!fs.existsSync(path.join(distPath, "index.html"))) {
      distPath = path.join(process.cwd(), "frontend", "dist");
    }
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
