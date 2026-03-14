import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── 10 Đọc hiểu (READING) ──────────────────────────────────────────────────
const readingItems = [
  {
    title: 'Bảo vệ môi trường sống',
    content: JSON.stringify({
      text: 'Môi trường sống là tài sản chung của toàn nhân loại. Việc bảo vệ môi trường không chỉ là trách nhiệm của mỗi cá nhân mà còn là nghĩa vụ của toàn xã hội. Các hoạt động như trồng cây xanh, giảm thiểu rác thải nhựa, tiết kiệm điện nước đều góp phần thiết thực vào công cuộc bảo vệ hành tinh. Chúng ta cần hành động ngay hôm nay để bảo vệ hành tinh xanh cho các thế hệ tương lai.',
      questions: [
        { id: 'q1', text: 'Tại sao bảo vệ môi trường lại quan trọng?', maxMark: 25 },
        { id: 'q2', text: 'Liệt kê 3 hành động bảo vệ môi trường trong cuộc sống hàng ngày.', maxMark: 25 },
        { id: 'q3', text: 'Biến đổi khí hậu ảnh hưởng như thế nào đến cuộc sống con người?', maxMark: 25 },
        { id: 'q4', text: 'Em có thể làm gì để góp phần bảo vệ môi trường tại trường học?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['môi trường', 'thiên nhiên', 'bảo vệ', 'biến đổi khí hậu']),
    level: 'intermediate',
    type: 'READING',
  },
  {
    title: 'Hòa bình và hợp tác quốc tế',
    content: JSON.stringify({
      text: 'Hòa bình là khát vọng muôn đời của nhân loại. Trong thế giới hiện đại, hợp tác quốc tế đóng vai trò then chốt trong việc duy trì hòa bình và ổn định. Các tổ chức như Liên Hợp Quốc, ASEAN hay Hội đồng Bảo an đều đang nỗ lực ngăn chặn xung đột và thúc đẩy đối thoại. Việt Nam luôn theo đuổi chính sách đối ngoại độc lập, tự chủ, đa phương hóa và đa dạng hóa quan hệ quốc tế.',
      questions: [
        { id: 'q1', text: 'Hòa bình có ý nghĩa gì đối với sự phát triển của một quốc gia?', maxMark: 25 },
        { id: 'q2', text: 'Các tổ chức quốc tế nào đóng vai trò quan trọng trong việc gìn giữ hòa bình?', maxMark: 25 },
        { id: 'q3', text: 'Việt Nam đã đóng góp như thế nào cho hòa bình khu vực và thế giới?', maxMark: 25 },
        { id: 'q4', text: 'Theo em, thế hệ trẻ có thể làm gì để góp phần xây dựng hòa bình?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['hòa bình', 'quốc tế', 'ngoại giao', 'hợp tác']),
    level: 'advanced',
    type: 'READING',
  },
  {
    title: 'An toàn trên không gian mạng',
    content: JSON.stringify({
      text: 'Internet và mạng xã hội đã trở thành một phần không thể thiếu trong cuộc sống hiện đại. Tuy nhiên, không gian mạng cũng tiềm ẩn nhiều nguy cơ như lừa đảo trực tuyến, đánh cắp thông tin cá nhân, bắt nạt mạng và tiếp xúc với nội dung độc hại. Mỗi người dùng cần có ý thức bảo vệ thông tin cá nhân và hành xử văn minh trên môi trường kỹ thuật số.',
      questions: [
        { id: 'q1', text: 'Các nguy cơ chính khi sử dụng mạng xã hội là gì?', maxMark: 25 },
        { id: 'q2', text: 'Làm thế nào để bảo vệ thông tin cá nhân khi sử dụng internet?', maxMark: 25 },
        { id: 'q3', text: 'Bắt nạt mạng là gì và có những hình thức nào?', maxMark: 25 },
        { id: 'q4', text: 'Em cần làm gì khi gặp tình huống không an toàn trên mạng?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['công nghệ', 'an toàn mạng', 'internet', 'mạng xã hội']),
    level: 'beginner',
    type: 'READING',
  },
  {
    title: 'Văn hóa truyền thống Việt Nam',
    content: JSON.stringify({
      text: 'Việt Nam là một quốc gia có nền văn hóa phong phú và đa dạng với hơn 4000 năm lịch sử. Các lễ hội truyền thống như Tết Nguyên Đán, Lễ hội Đền Hùng, Hội Lim hay Lễ hội Chùa Hương đều mang đậm bản sắc dân tộc. Bên cạnh đó, các nghề thủ công truyền thống như gốm Bát Tràng, lụa Hà Đông, tranh Đông Hồ cũng cần được gìn giữ và phát huy trong thời đại hội nhập.',
      questions: [
        { id: 'q1', text: 'Kể tên 5 lễ hội truyền thống quan trọng của Việt Nam và ý nghĩa của chúng.', maxMark: 25 },
        { id: 'q2', text: 'Tại sao cần bảo tồn các nghề thủ công truyền thống?', maxMark: 25 },
        { id: 'q3', text: 'Hội nhập quốc tế ảnh hưởng như thế nào đến văn hóa truyền thống Việt Nam?', maxMark: 25 },
        { id: 'q4', text: 'Thế hệ trẻ có thể làm gì để bảo tồn và phát huy văn hóa dân tộc?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['văn hóa', 'truyền thống', 'Việt Nam', 'lễ hội', 'nghề thủ công']),
    level: 'intermediate',
    type: 'READING',
  },
  {
    title: 'Khởi nghiệp và đổi mới sáng tạo',
    content: JSON.stringify({
      text: 'Khởi nghiệp (startup) đang trở thành xu hướng toàn cầu, đặc biệt trong bối cảnh cuộc cách mạng công nghiệp 4.0. Những cái tên như VNG, MoMo, Tiki hay Sky Mavis đã chứng minh rằng người Việt Nam hoàn toàn có thể xây dựng các sản phẩm công nghệ tầm cỡ thế giới. Với dân số trẻ và năng động, Việt Nam đang nổi lên như một trong những hệ sinh thái khởi nghiệp sôi động nhất Đông Nam Á.',
      questions: [
        { id: 'q1', text: 'Khởi nghiệp là gì và tại sao nó quan trọng với nền kinh tế?', maxMark: 25 },
        { id: 'q2', text: 'Những kỹ năng nào cần thiết để trở thành một doanh nhân thành công?', maxMark: 25 },
        { id: 'q3', text: 'Cách mạng công nghiệp 4.0 tạo ra những cơ hội khởi nghiệp nào?', maxMark: 25 },
        { id: 'q4', text: 'Nếu em muốn khởi nghiệp, em sẽ bắt đầu từ đâu và làm gì?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['khởi nghiệp', 'đổi mới', 'công nghệ', 'kinh tế', 'sáng tạo']),
    level: 'advanced',
    type: 'READING',
  },
  {
    title: 'Giáo dục và phát triển bản thân',
    content: JSON.stringify({
      text: 'Giáo dục không chỉ là việc truyền đạt kiến thức mà còn là quá trình phát triển toàn diện của mỗi cá nhân. Các nghiên cứu cho thấy người có thói quen đọc sách mỗi ngày sẽ tích lũy được lượng kiến thức khổng lồ sau nhiều năm. Trong thời đại 4.0, việc tự học và nâng cao năng lực bản thân thông qua các nền tảng trực tuyến như Coursera, edX hay Khan Academy trở thành yếu tố quyết định sự thành công.',
      questions: [
        { id: 'q1', text: 'Giáo dục đóng vai trò gì trong sự phát triển của mỗi cá nhân?', maxMark: 25 },
        { id: 'q2', text: 'Kể tên 3 kỹ năng quan trọng nhất cần phát triển trong thế kỷ 21.', maxMark: 25 },
        { id: 'q3', text: 'Làm thế nào để duy trì thói quen tự học hiệu quả?', maxMark: 25 },
        { id: 'q4', text: 'Em đã làm gì để cải thiện bản thân trong năm vừa qua?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['giáo dục', 'phát triển bản thân', 'kỹ năng', 'tự học']),
    level: 'intermediate',
    type: 'READING',
  },
  {
    title: 'Bình đẳng giới và vai trò phụ nữ',
    content: JSON.stringify({
      text: 'Bình đẳng giới là một trong những mục tiêu phát triển bền vững quan trọng nhất của Liên Hợp Quốc. Phụ nữ Việt Nam trong suốt chiều dài lịch sử đã đóng góp to lớn cho sự phát triển của đất nước – từ những nữ anh hùng như Hai Bà Trưng, Bà Triệu đến các nhà khoa học, lãnh đạo ngày nay. Ngày nay, phụ nữ ngày càng khẳng định vị thế quan trọng trong mọi lĩnh vực của xã hội, từ chính trị, kinh tế đến khoa học và nghệ thuật.',
      questions: [
        { id: 'q1', text: 'Bình đẳng giới có nghĩa là gì trong xã hội hiện đại?', maxMark: 25 },
        { id: 'q2', text: 'Phụ nữ Việt Nam đã đóng góp như thế nào cho sự nghiệp bảo vệ và xây dựng đất nước?', maxMark: 25 },
        { id: 'q3', text: 'Những rào cản nào mà phụ nữ vẫn đang phải đối mặt trong xã hội ngày nay?', maxMark: 25 },
        { id: 'q4', text: 'Em có thể làm gì để thúc đẩy bình đẳng giới trong cuộc sống hàng ngày?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['bình đẳng giới', 'phụ nữ', 'xã hội', 'quyền con người']),
    level: 'intermediate',
    type: 'READING',
  },
  {
    title: 'Năng lượng tái tạo và tương lai xanh',
    content: JSON.stringify({
      text: 'Năng lượng tái tạo như điện mặt trời, điện gió và thủy điện đang trở thành xu hướng tất yếu trong bối cảnh nguồn năng lượng hóa thạch ngày càng cạn kiệt và ô nhiễm môi trường ngày càng nghiêm trọng. Việt Nam với bờ biển dài hơn 3000km và nhiều giờ nắng mỗi năm có tiềm năng lớn để phát triển điện gió ngoài khơi và điện mặt trời áp mái. Chính phủ đã đặt mục tiêu đạt 50% năng lượng tái tạo vào năm 2030.',
      questions: [
        { id: 'q1', text: 'Năng lượng tái tạo là gì và tại sao nó quan trọng?', maxMark: 25 },
        { id: 'q2', text: 'Liệt kê và giải thích 4 loại năng lượng tái tạo phổ biến.', maxMark: 25 },
        { id: 'q3', text: 'Việt Nam có những lợi thế gì trong việc phát triển năng lượng tái tạo?', maxMark: 25 },
        { id: 'q4', text: 'Theo em, chúng ta cần làm gì để đẩy nhanh chuyển đổi sang năng lượng sạch?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['năng lượng tái tạo', 'môi trường', 'phát triển bền vững', 'công nghệ xanh']),
    level: 'advanced',
    type: 'READING',
  },
  {
    title: 'Sức khỏe tâm thần và lối sống lành mạnh',
    content: JSON.stringify({
      text: 'Sức khỏe tâm thần là một phần thiết yếu của sức khỏe tổng thể, nhưng thường bị xem nhẹ hơn so với sức khỏe thể chất. Theo Tổ chức Y tế Thế giới (WHO), cứ 4 người thì có 1 người gặp vấn đề về sức khỏe tâm thần trong cuộc đời. Trong xã hội hiện đại với nhiều áp lực từ học tập, công việc và cuộc sống, việc chăm sóc sức khỏe tâm thần bằng cách ngủ đủ giấc, tập thể dục và duy trì các mối quan hệ xã hội lành mạnh ngày càng trở nên quan trọng.',
      questions: [
        { id: 'q1', text: 'Sức khỏe tâm thần là gì và tại sao nó quan trọng?', maxMark: 25 },
        { id: 'q2', text: 'Liệt kê 5 dấu hiệu cho thấy một người có thể đang gặp vấn đề về sức khỏe tâm thần.', maxMark: 25 },
        { id: 'q3', text: 'Làm thế nào để duy trì lối sống lành mạnh trong thời đại công nghệ số?', maxMark: 25 },
        { id: 'q4', text: 'Em sẽ làm gì khi bạn bè hoặc người thân có dấu hiệu stress hoặc trầm cảm?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['sức khỏe', 'tâm thần', 'lối sống', 'stress', 'hạnh phúc']),
    level: 'beginner',
    type: 'READING',
  },
  {
    title: 'Đô thị hóa và cuộc sống hiện đại',
    content: JSON.stringify({
      text: 'Đô thị hóa là xu hướng tất yếu của thế giới khi ngày càng nhiều người di cư từ nông thôn lên thành phố để tìm kiếm cơ hội việc làm và cuộc sống tốt hơn. Tại Việt Nam, tỷ lệ đô thị hóa tăng từ 19% năm 1990 lên hơn 40% hiện nay. Điều này tạo ra nhiều cơ hội nhưng cũng đặt ra nhiều thách thức về quy hoạch đô thị, giao thông, ô nhiễm và bất bình đẳng xã hội.',
      questions: [
        { id: 'q1', text: 'Đô thị hóa là gì? Quá trình này diễn ra như thế nào ở Việt Nam?', maxMark: 25 },
        { id: 'q2', text: 'Đô thị hóa mang lại những lợi ích và thách thức gì cho xã hội?', maxMark: 25 },
        { id: 'q3', text: 'Các vấn đề nào nảy sinh khi dân số đô thị tăng nhanh?', maxMark: 25 },
        { id: 'q4', text: 'Theo em, cần làm gì để xây dựng đô thị bền vững và đáng sống?', maxMark: 25 },
      ],
    }),
    tags: JSON.stringify(['đô thị hóa', 'xã hội', 'quy hoạch', 'phát triển bền vững']),
    level: 'intermediate',
    type: 'READING',
  },
];

// ── 10 Tích hợp ngắn (INTEGRATION) ────────────────────────────────────────
const integrationItems = [
  {
    title: 'Toàn cầu hóa và hội nhập kinh tế',
    content: JSON.stringify({
      text: 'Toàn cầu hóa là quá trình hội nhập và tương tác giữa các quốc gia thông qua thương mại, đầu tư, công nghệ và văn hóa. Việt Nam đã tích cực tham gia vào quá trình hội nhập kinh tế quốc tế qua nhiều hiệp định thương mại tự do như CPTPP, EVFTA. Xuất khẩu của Việt Nam đã tăng gấp 5 lần trong vòng 10 năm qua nhờ tận dụng tốt các hiệp định này.',
      integrationPrompt: 'Dựa vào đoạn văn trên và hiểu biết của em, hãy viết một đoạn văn ngắn (khoảng 150-200 từ) trình bày những cơ hội và thách thức mà toàn cầu hóa mang lại cho người lao động Việt Nam.',
      wordLimit: 200,
    }),
    tags: JSON.stringify(['toàn cầu hóa', 'kinh tế', 'hội nhập', 'thương mại quốc tế']),
    level: 'advanced',
    type: 'INTEGRATION',
  },
  {
    title: 'Nghệ thuật và âm nhạc dân tộc Việt Nam',
    content: JSON.stringify({
      text: 'Âm nhạc và nghệ thuật truyền thống Việt Nam là kho báu văn hóa vô giá, được hun đúc qua hàng nghìn năm lịch sử. Từ những làn điệu dân ca, hò vè, quan họ Bắc Ninh (Di sản phi vật thể của UNESCO) đến các loại hình nghệ thuật như chèo, tuồng, cải lương, đều mang đậm bản sắc văn hóa dân tộc và cần được gìn giữ.',
      integrationPrompt: 'Hãy viết một đoạn văn ngắn (khoảng 150 từ) bày tỏ cảm nhận của em về tầm quan trọng của việc bảo tồn nghệ thuật dân tộc trong thời đại hiện nay và đề xuất một giải pháp cụ thể.',
      wordLimit: 150,
    }),
    tags: JSON.stringify(['nghệ thuật', 'âm nhạc', 'truyền thống', 'văn hóa dân tộc', 'Việt Nam']),
    level: 'beginner',
    type: 'INTEGRATION',
  },
  {
    title: 'Khoa học và công nghệ trong cuộc sống',
    content: JSON.stringify({
      text: 'Khoa học và công nghệ đang thay đổi thế giới với tốc độ chưa từng có. Trí tuệ nhân tạo (AI) đã giúp máy tính có thể dịch thuật, nhận diện khuôn mặt, lái xe tự động và thậm chí viết văn, sáng tác thơ. Công nghệ sinh học đang mở ra những liệu pháp gen mới để điều trị ung thư và các bệnh di truyền. Những tiến bộ này tạo ra cả cơ hội lẫn thách thức mới cho nhân loại.',
      integrationPrompt: 'Dựa vào đoạn văn và kiến thức của em, hãy viết một đoạn văn ngắn (khoảng 150-200 từ) phân tích ảnh hưởng của trí tuệ nhân tạo đến một lĩnh vực nghề nghiệp mà em quan tâm.',
      wordLimit: 200,
    }),
    tags: JSON.stringify(['khoa học', 'công nghệ', 'AI', 'đổi mới', 'tương lai']),
    level: 'intermediate',
    type: 'INTEGRATION',
  },
  {
    title: 'Ô nhiễm môi trường biển',
    content: JSON.stringify({
      text: 'Đại dương bao phủ hơn 70% bề mặt Trái Đất và là nguồn sống của hàng triệu loài sinh vật. Tuy nhiên, mỗi năm có khoảng 8 triệu tấn rác nhựa được thải ra biển, đe dọa nghiêm trọng các hệ sinh thái biển. Rác thải nhựa phân hủy thành vi nhựa, xâm nhập vào chuỗi thức ăn và cuối cùng ảnh hưởng đến sức khỏe con người. Việt Nam là một trong những quốc gia gây ô nhiễm biển hàng đầu thế giới.',
      integrationPrompt: 'Hãy viết đoạn văn ngắn (khoảng 150 từ) thể hiện suy nghĩ của em về trách nhiệm của cá nhân và cộng đồng trong việc giảm thiểu ô nhiễm nhựa đại dương.',
      wordLimit: 150,
    }),
    tags: JSON.stringify(['ô nhiễm', 'biển', 'nhựa', 'môi trường', 'hệ sinh thái']),
    level: 'intermediate',
    type: 'INTEGRATION',
  },
  {
    title: 'Vai trò của tình nguyện trong xã hội',
    content: JSON.stringify({
      text: 'Tình nguyện là hành động tự nguyện cống hiến thời gian và công sức vì lợi ích cộng đồng mà không vì mục đích vật chất. Ở Việt Nam, phong trào thanh niên tình nguyện đã đóng góp đáng kể vào các hoạt động xây dựng nông thôn mới, hỗ trợ vùng sâu vùng xa, ứng phó thiên tai và chăm sóc người cao tuổi. Qua hoạt động tình nguyện, giới trẻ không chỉ giúp đỡ cộng đồng mà còn rèn luyện bản thân và mở rộng mạng lưới quan hệ.',
      integrationPrompt: 'Hãy viết một đoạn văn ngắn (khoảng 120-150 từ) chia sẻ một hoạt động tình nguyện mà em đã tham gia hoặc muốn tham gia, và những giá trị em học được từ đó.',
      wordLimit: 150,
    }),
    tags: JSON.stringify(['tình nguyện', 'cộng đồng', 'xã hội', 'thanh niên']),
    level: 'beginner',
    type: 'INTEGRATION',
  },
  {
    title: 'Chuyển đổi số và kinh tế số',
    content: JSON.stringify({
      text: 'Chuyển đổi số là quá trình ứng dụng công nghệ kỹ thuật số để thay đổi căn bản cách thức vận hành của doanh nghiệp và xã hội. Kinh tế số Việt Nam được dự báo sẽ đạt 50 tỷ USD vào năm 2025, với sự bứt phá của thương mại điện tử, fintech và du lịch trực tuyến. Chương trình chuyển đổi số quốc gia đặt mục tiêu đưa Việt Nam vào nhóm 50 quốc gia dẫn đầu về Chính phủ điện tử vào năm 2025.',
      integrationPrompt: 'Dựa vào đoạn văn, hãy viết một đoạn văn ngắn (khoảng 150-200 từ) phân tích tác động của chuyển đổi số đến một ngành nghề hoặc lĩnh vực cụ thể ở Việt Nam mà em quan tâm.',
      wordLimit: 200,
    }),
    tags: JSON.stringify(['chuyển đổi số', 'kinh tế số', 'công nghệ', 'Việt Nam']),
    level: 'advanced',
    type: 'INTEGRATION',
  },
  {
    title: 'Du lịch bền vững',
    content: JSON.stringify({
      text: 'Du lịch bền vững là loại hình du lịch đáp ứng nhu cầu của khách du lịch hiện tại mà không ảnh hưởng tiêu cực đến khả năng đáp ứng nhu cầu của thế hệ tương lai, đặc biệt là người dân địa phương. Việt Nam với vẻ đẹp thiên nhiên đa dạng từ Vịnh Hạ Long, Phong Nha-Kẻ Bàng đến đồng bằng sông Cửu Long đang phát triển du lịch xanh, du lịch cộng đồng nhằm bảo vệ môi trường và tạo sinh kế cho người dân bản địa.',
      integrationPrompt: 'Hãy viết một đoạn văn ngắn (khoảng 150 từ) giải thích tại sao em nghĩ du lịch bền vững quan trọng và nêu 2-3 hành động cụ thể để trở thành một khách du lịch có trách nhiệm.',
      wordLimit: 150,
    }),
    tags: JSON.stringify(['du lịch', 'bền vững', 'môi trường', 'cộng đồng']),
    level: 'intermediate',
    type: 'INTEGRATION',
  },
  {
    title: 'Dinh dưỡng và sức khỏe học đường',
    content: JSON.stringify({
      text: 'Dinh dưỡng hợp lý là nền tảng cho sức khỏe thể chất và tinh thần của học sinh. Nghiên cứu cho thấy học sinh ăn sáng đầy đủ có khả năng tập trung tốt hơn 20% so với những em bỏ bữa sáng. Tuy nhiên, hiện nay nhiều học sinh đang có thói quen ăn uống không lành mạnh như tiêu thụ nhiều đồ ăn nhanh, nước ngọt có ga và thiếu rau xanh, trái cây dẫn đến tình trạng thừa cân, thiếu vi chất.',
      integrationPrompt: 'Dựa vào đoạn văn trên, hãy viết một đoạn văn ngắn (khoảng 120-150 từ) mô tả thực trạng dinh dưỡng của học sinh hiện nay và đề xuất một thay đổi nhỏ trong thói quen ăn uống mà em có thể thực hiện ngay.',
      wordLimit: 150,
    }),
    tags: JSON.stringify(['sức khỏe', 'dinh dưỡng', 'học sinh', 'lối sống']),
    level: 'beginner',
    type: 'INTEGRATION',
  },
  {
    title: 'Biến đổi khí hậu và thách thức toàn cầu',
    content: JSON.stringify({
      text: 'Biến đổi khí hậu là thách thức lớn nhất mà nhân loại đang đối mặt trong thế kỷ 21. Nhiệt độ Trái Đất đã tăng 1,1°C so với thời kỳ tiền công nghiệp, dẫn đến băng tan, mực nước biển dâng, thời tiết cực đoan ngày càng thường xuyên hơn. Việt Nam là một trong 5 quốc gia dễ bị tổn thương nhất bởi biến đổi khí hậu, với Đồng bằng sông Cửu Long đối mặt với nguy cơ ngập mặn nghiêm trọng.',
      integrationPrompt: 'Hãy viết đoạn văn ngắn (khoảng 150-200 từ) phân tích một tác động cụ thể của biến đổi khí hậu đến Việt Nam và đề xuất giải pháp thích ứng ở cấp độ cá nhân, cộng đồng hoặc quốc gia.',
      wordLimit: 200,
    }),
    tags: JSON.stringify(['biến đổi khí hậu', 'môi trường', 'Việt Nam', 'thách thức toàn cầu']),
    level: 'advanced',
    type: 'INTEGRATION',
  },
  {
    title: 'Giao thông và an toàn đường bộ',
    content: JSON.stringify({
      text: 'Tai nạn giao thông là một trong những nguyên nhân gây tử vong hàng đầu tại Việt Nam, với khoảng 11.000 người chết mỗi năm. Nguyên nhân chủ yếu bao gồm vi phạm tốc độ, sử dụng rượu bia khi lái xe và không đội mũ bảo hiểm. Mặc dù luật pháp đã có nhiều quy định nghiêm ngặt, ý thức chấp hành luật giao thông của một bộ phận người dân vẫn còn thấp. Văn hóa giao thông cần được giáo dục từ sớm.',
      integrationPrompt: 'Dựa vào đoạn văn trên, hãy viết một đoạn văn ngắn (khoảng 120-150 từ) nêu nhận xét của em về ý thức tham gia giao thông của giới trẻ hiện nay và đề xuất cách nâng cao văn hóa giao thông trong trường học.',
      wordLimit: 150,
    }),
    tags: JSON.stringify(['giao thông', 'an toàn', 'luật pháp', 'ý thức cộng đồng']),
    level: 'beginner',
    type: 'INTEGRATION',
  },
];

const libraryItems = [...readingItems, ...integrationItems];

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