import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const libraryItems = [
  {
    title: 'Bảo vệ môi trường sống',
    content: JSON.stringify({
      text: 'Môi trường sống là tài sản chung của toàn nhân loại. Việc bảo vệ môi trường không chỉ là trách nhiệm của mỗi cá nhân mà còn là nghĩa vụ của toàn xã hội. Chúng ta cần hành động ngay hôm nay để bảo vệ hành tinh xanh cho các thế hệ tương lai.',
      questions: [
        { id: 'q1', text: 'Tại sao bảo vệ môi trường lại quan trọng?', maxMark: 25 },
        { id: 'q2', text: 'Liệt kê 3 hành động bảo vệ môi trường trong cuộc sống hàng ngày.', maxMark: 25 },
        { id: 'q3', text: 'Biến đổi khí hậu ảnh hưởng như thế nào đến cuộc sống con người?', maxMark: 25 },
        { id: 'q4', text: 'Em có thể làm gì để góp phần bảo vệ môi trường tại trường học?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['môi trường', 'thiên nhiên', 'bảo vệ', 'biến đổi khí hậu']),
    level: 'intermediate',
  },
  {
    title: 'Hòa bình và hợp tác quốc tế',
    content: JSON.stringify({
      text: 'Hòa bình là khát vọng muôn đời của nhân loại. Trong thế giới hiện đại, hợp tác quốc tế đóng vai trò then chốt trong việc duy trì hòa bình và ổn định. Việt Nam luôn theo đuổi chính sách đối ngoại độc lập, tự chủ, đa phương hóa và đa dạng hóa quan hệ quốc tế.',
      questions: [
        { id: 'q1', text: 'Hòa bình có ý nghĩa gì đối với sự phát triển của một quốc gia?', maxMark: 25 },
        { id: 'q2', text: 'Các tổ chức quốc tế nào đóng vai trò quan trọng trong việc gìn giữ hòa bình?', maxMark: 25 },
        { id: 'q3', text: 'Việt Nam đã đóng góp như thế nào cho hòa bình khu vực và thế giới?', maxMark: 25 },
        { id: 'q4', text: 'Theo em, thế hệ trẻ có thể làm gì để góp phần xây dựng hòa bình?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['hòa bình', 'quốc tế', 'ngoại giao', 'hợp tác']),
    level: 'advanced',
  },
  {
    title: 'An toàn trên không gian mạng',
    content: JSON.stringify({
      text: 'Internet và mạng xã hội đã trở thành một phần không thể thiếu trong cuộc sống hiện đại. Tuy nhiên, không gian mạng cũng tiềm ẩn nhiều nguy cơ như lừa đảo trực tuyến, đánh cắp thông tin cá nhân, bắt nạt mạng và tiếp xúc với nội dung độc hại.',
      questions: [
        { id: 'q1', text: 'Các nguy cơ chính khi sử dụng mạng xã hội là gì?', maxMark: 25 },
        { id: 'q2', text: 'Làm thế nào để bảo vệ thông tin cá nhân khi sử dụng internet?', maxMark: 25 },
        { id: 'q3', text: 'Bắt nạt mạng là gì và có những hình thức nào?', maxMark: 25 },
        { id: 'q4', text: 'Em cần làm gì khi gặp tình huống không an toàn trên mạng?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['công nghệ', 'an toàn mạng', 'internet', 'mạng xã hội']),
    level: 'beginner',
  },
  {
    title: 'Văn hóa truyền thống Việt Nam',
    content: JSON.stringify({
      text: 'Việt Nam là một quốc gia có nền văn hóa phong phú và đa dạng với hơn 4000 năm lịch sử. Các lễ hội truyền thống, phong tục tập quán và nghề thủ công truyền thống là những giá trị văn hóa quý báu cần được gìn giữ và phát huy trong thời đại hội nhập.',
      questions: [
        { id: 'q1', text: 'Kể tên 5 lễ hội truyền thống quan trọng của Việt Nam và ý nghĩa của chúng.', maxMark: 25 },
        { id: 'q2', text: 'Tại sao cần bảo tồn các nghề thủ công truyền thống?', maxMark: 25 },
        { id: 'q3', text: 'Hội nhập quốc tế ảnh hưởng như thế nào đến văn hóa truyền thống Việt Nam?', maxMark: 25 },
        { id: 'q4', text: 'Thế hệ trẻ có thể làm gì để bảo tồn và phát huy văn hóa dân tộc?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['văn hóa', 'truyền thống', 'Việt Nam', 'lễ hội', 'nghề thủ công']),
    level: 'intermediate',
  },
  {
    title: 'Khởi nghiệp và đổi mới sáng tạo',
    content: JSON.stringify({
      text: 'Khởi nghiệp (startup) đang trở thành xu hướng toàn cầu, đặc biệt trong bối cảnh cuộc cách mạng công nghiệp 4.0. Việt Nam với dân số trẻ và năng động đang nổi lên như một trong những hệ sinh thái khởi nghiệp sôi động nhất Đông Nam Á.',
      questions: [
        { id: 'q1', text: 'Khởi nghiệp là gì và tại sao nó quan trọng với nền kinh tế?', maxMark: 25 },
        { id: 'q2', text: 'Những kỹ năng nào cần thiết để trở thành một doanh nhân thành công?', maxMark: 25 },
        { id: 'q3', text: 'Cách mạng công nghiệp 4.0 tạo ra những cơ hội khởi nghiệp nào?', maxMark: 25 },
        { id: 'q4', text: 'Nếu em muốn khởi nghiệp, em sẽ bắt đầu từ đâu và làm gì?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['khởi nghiệp', 'đổi mới', 'công nghệ', 'kinh tế', 'sáng tạo']),
    level: 'advanced',
  },
  {
    title: 'Giáo dục và phát triển bản thân',
    content: JSON.stringify({
      text: 'Giáo dục không chỉ là việc truyền đạt kiến thức mà còn là quá trình phát triển toàn diện của mỗi cá nhân. Trong thời đại 4.0, việc tự học và nâng cao năng lực bản thân trở thành yếu tố quyết định sự thành công của mỗi người.',
      questions: [
        { id: 'q1', text: 'Giáo dục đóng vai trò gì trong sự phát triển của mỗi cá nhân?', maxMark: 25 },
        { id: 'q2', text: 'Kể tên 3 kỹ năng quan trọng nhất cần phát triển trong thế kỷ 21.', maxMark: 25 },
        { id: 'q3', text: 'Làm thế nào để duy trì thói quen tự học hiệu quả?', maxMark: 25 },
        { id: 'q4', text: 'Em đã làm gì để cải thiện bản thân trong năm vừa qua?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['giáo dục', 'phát triển bản thân', 'kỹ năng', 'tự học']),
    level: 'intermediate',
  },
  {
    title: 'Bình đẳng giới và vai trò phụ nữ',
    content: JSON.stringify({
      text: 'Bình đẳng giới là một trong những mục tiêu phát triển bền vững quan trọng nhất. Phụ nữ Việt Nam trong suốt chiều dài lịch sử đã đóng góp to lớn cho sự phát triển của đất nước. Ngày nay, phụ nữ ngày càng khẳng định vị thế quan trọng trong mọi lĩnh vực của xã hội.',
      questions: [
        { id: 'q1', text: 'Bình đẳng giới có nghĩa là gì trong xã hội hiện đại?', maxMark: 25 },
        { id: 'q2', text: 'Phụ nữ Việt Nam đã đóng góp như thế nào cho sự nghiệp bảo vệ và xây dựng đất nước?', maxMark: 25 },
        { id: 'q3', text: 'Những rào cản nào mà phụ nữ vẫn đang phải đối mặt trong xã hội ngày nay?', maxMark: 25 },
        { id: 'q4', text: 'Em có thể làm gì để thúc đẩy bình đẳng giới trong cuộc sống hàng ngày?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['bình đẳng giới', 'phụ nữ', 'xã hội', 'quyền con người']),
    level: 'intermediate',
  },
  {
    title: 'Năng lượng tái tạo và tương lai xanh',
    content: JSON.stringify({
      text: 'Năng lượng tái tạo như điện mặt trời, điện gió và thủy điện đang trở thành xu hướng tất yếu trong bối cảnh nguồn năng lượng hóa thạch ngày càng cạn kiệt và ô nhiễm môi trường ngày càng nghiêm trọng. Việt Nam với điều kiện tự nhiên thuận lợi có tiềm năng lớn để phát triển năng lượng tái tạo.',
      questions: [
        { id: 'q1', text: 'Năng lượng tái tạo là gì và tại sao nó quan trọng?', maxMark: 25 },
        { id: 'q2', text: 'Liệt kê và giải thích 4 loại năng lượng tái tạo phổ biến.', maxMark: 25 },
        { id: 'q3', text: 'Việt Nam có những lợi thế gì trong việc phát triển năng lượng tái tạo?', maxMark: 25 },
        { id: 'q4', text: 'Theo em, chúng ta cần làm gì để đẩy nhanh chuyển đổi sang năng lượng sạch?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['năng lượng tái tạo', 'môi trường', 'phát triển bền vững', 'công nghệ xanh']),
    level: 'advanced',
  },
  {
    title: 'Toàn cầu hóa và hội nhập kinh tế',
    content: JSON.stringify({
      text: 'Toàn cầu hóa là quá trình hội nhập và tương tác giữa các quốc gia thông qua thương mại, đầu tư, công nghệ và văn hóa. Việt Nam đã tích cực tham gia vào quá trình hội nhập kinh tế quốc tế qua nhiều hiệp định thương mại tự do như CPTPP, EVFTA.',
      questions: [
        { id: 'q1', text: 'Toàn cầu hóa mang lại những cơ hội và thách thức gì cho Việt Nam?', maxMark: 25 },
        { id: 'q2', text: 'Hội nhập kinh tế quốc tế ảnh hưởng như thế nào đến cuộc sống người dân Việt Nam?', maxMark: 25 },
        { id: 'q3', text: 'Việt Nam cần chuẩn bị những gì để cạnh tranh trong nền kinh tế toàn cầu?', maxMark: 25 },
        { id: 'q4', text: 'Em muốn đóng góp gì cho sự phát triển kinh tế của đất nước trong tương lai?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['toàn cầu hóa', 'kinh tế', 'hội nhập', 'thương mại quốc tế']),
    level: 'advanced',
  },
  {
    title: 'Nghệ thuật và âm nhạc dân tộc Việt Nam',
    content: JSON.stringify({
      text: 'Âm nhạc và nghệ thuật truyền thống Việt Nam là kho báu văn hóa vô giá, được hun đúc qua hàng nghìn năm lịch sử. Từ những làn điệu dân ca, hò vè đến các loại hình nghệ thuật như chèo, tuồng, cải lương, đều mang đậm bản sắc văn hóa dân tộc.',
      questions: [
        { id: 'q1', text: 'Kể tên 5 thể loại âm nhạc và nghệ thuật truyền thống Việt Nam mà em biết.', maxMark: 25 },
        { id: 'q2', text: 'Tại sao cần bảo tồn và phát huy nghệ thuật truyền thống trong thời đại hiện nay?', maxMark: 25 },
        { id: 'q3', text: 'Âm nhạc dân tộc Việt Nam có những đặc điểm gì nổi bật so với âm nhạc phương Tây?', maxMark: 25 },
        { id: 'q4', text: 'Em đã từng tham gia hoặc thưởng thức loại hình nghệ thuật truyền thống nào? Cảm nhận của em như thế nào?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['nghệ thuật', 'âm nhạc', 'truyền thống', 'văn hóa dân tộc', 'Việt Nam']),
    level: 'beginner',
  },
  {
    title: 'Khoa học và công nghệ trong cuộc sống',
    content: JSON.stringify({
      text: 'Khoa học và công nghệ đang thay đổi thế giới với tốc độ chưa từng có. Từ trí tuệ nhân tạo, robot đến công nghệ sinh học và vũ trụ, những tiến bộ khoa học đang tạo ra những cơ hội và thách thức mới cho nhân loại.',
      questions: [
        { id: 'q1', text: 'Hãy nêu 3 phát minh khoa học quan trọng nhất trong thế kỷ 21 và tác động của chúng.', maxMark: 25 },
        { id: 'q2', text: 'Trí tuệ nhân tạo (AI) sẽ thay đổi thị trường lao động như thế nào?', maxMark: 25 },
        { id: 'q3', text: 'Công nghệ sinh học có thể giúp giải quyết những vấn đề gì của nhân loại?', maxMark: 25 },
        { id: 'q4', text: 'Em muốn theo đuổi ngành khoa học hoặc công nghệ nào trong tương lai? Tại sao?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['khoa học', 'công nghệ', 'AI', 'đổi mới', 'tương lai']),
    level: 'intermediate',
  },
  {
    title: 'Sức khỏe tâm thần và lối sống lành mạnh',
    content: JSON.stringify({
      text: 'Sức khỏe tâm thần là một phần thiết yếu của sức khỏe tổng thể. Trong xã hội hiện đại với nhiều áp lực từ học tập, công việc và cuộc sống, việc chăm sóc sức khỏe tâm thần ngày càng trở nên quan trọng hơn bao giờ hết.',
      questions: [
        { id: 'q1', text: 'Sức khỏe tâm thần là gì và tại sao nó quan trọng?', maxMark: 25 },
        { id: 'q2', text: 'Liệt kê 5 dấu hiệu cho thấy một người có thể đang gặp vấn đề về sức khỏe tâm thần.', maxMark: 25 },
        { id: 'q3', text: 'Làm thế nào để duy trì lối sống lành mạnh trong thời đại công nghệ số?', maxMark: 25 },
        { id: 'q4', text: 'Em sẽ làm gì khi bạn bè hoặc người thân có dấu hiệu stress hoặc trầm cảm?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['sức khỏe', 'tâm thần', 'lối sống', 'stress', 'hạnh phúc']),
    level: 'beginner',
  },
];

const rubrics = [
  {
    name: 'Rubric Môi trường & Hòa bình',
    rulesJson: JSON.stringify([
      { criterion: 'Nội dung chính xác', weight: 0.3, description: 'Thông tin được trình bày chính xác và đúng sự thật' },
      { criterion: 'Lập luận logic', weight: 0.3, description: 'Các luận điểm được sắp xếp theo trình tự hợp lý' },
      { criterion: 'Tính sáng tạo', weight: 0.2, description: 'Có các ý tưởng mới và cách tiếp cận độc đáo' },
      { criterion: 'Diễn đạt rõ ràng', weight: 0.2, description: 'Ngôn ngữ rõ ràng, dễ hiểu và phù hợp' },
    ]),
    threshold: 0.6,
    scope: 'community-environment',
  },
  {
    name: 'Rubric Công nghệ & Đổi mới',
    rulesJson: JSON.stringify([
      { criterion: 'Hiểu biết về công nghệ', weight: 0.35, description: 'Thể hiện sự hiểu biết sâu về chủ đề công nghệ' },
      { criterion: 'Ứng dụng thực tế', weight: 0.3, description: 'Kết nối lý thuyết với thực tiễn cuộc sống' },
      { criterion: 'Tư duy phản biện', weight: 0.2, description: 'Phân tích vấn đề từ nhiều góc độ' },
      { criterion: 'Trình bày chuyên nghiệp', weight: 0.15, description: 'Bài viết được trình bày cẩn thận và chuyên nghiệp' },
    ]),
    threshold: 0.65,
    scope: 'community-technology',
  },
  {
    name: 'Rubric Văn hóa & Xã hội',
    rulesJson: JSON.stringify([
      { criterion: 'Kiến thức văn hóa', weight: 0.3, description: 'Hiểu biết về văn hóa, lịch sử và xã hội' },
      { criterion: 'Tính nhân văn', weight: 0.3, description: 'Thể hiện sự đồng cảm và tôn trọng đa dạng văn hóa' },
      { criterion: 'Cấu trúc bài viết', weight: 0.2, description: 'Bài viết có cấu trúc rõ ràng, mạch lạc' },
      { criterion: 'Dẫn chứng cụ thể', weight: 0.2, description: 'Sử dụng ví dụ và dẫn chứng cụ thể, thuyết phục' },
    ]),
    threshold: 0.55,
    scope: 'community-culture',
  },
];

const users = [
  {
    name: 'Học Sinh Mẫu',
    email: 'student@test.com',
    password: '123456',
    role: 'STUDENT',
  },
  {
    name: 'Giáo Viên Mẫu',
    email: 'teacher@test.com',
    password: '123456',
    role: 'TEACHER',
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  for (const userData of users) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          passwordHash: hashedPassword,
          role: userData.role,
        },
      });
      console.log(`✅ Created user: ${userData.email}`);
    }
  }

  // Seed library items
  for (const item of libraryItems) {
    const existing = await prisma.libraryItem.findFirst({ where: { title: item.title } });
    if (!existing) {
      await prisma.libraryItem.create({ data: item });
    }
  }

  // Seed rubrics
  for (const rubric of rubrics) {
    const existing = await prisma.rubric.findFirst({ where: { scope: rubric.scope } });
    if (!existing) {
      await prisma.rubric.create({ data: rubric });
    }
  }

  const itemCount = await prisma.libraryItem.count();
  const rubricCount = await prisma.rubric.count();
  console.log(`✅ Seed complete: ${itemCount} library items, ${rubricCount} rubrics`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
