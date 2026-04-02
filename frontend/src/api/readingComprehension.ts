import { TextDetail, SubmitAnswerRequest, SubmitAnswerResponse, Question } from '../types/readingComprehension'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const useMock = !BASE_URL

console.log('🔍 Reading Comprehension API Config:', { BASE_URL, useMock })

// 👇 Thêm mock data cho TẤT CẢ văn bản có hasReadingQuiz = true
const mockTextDetails: Record<string, TextDetail> = {
  t_env_01: {
    id: 't_env_01',
    title: 'Bạch tuộc',
    type: 'Văn bản',
    categoryId: 'env',
    categoryName: 'Giáo dục về môi trường',
    difficulty: 'Trung bình',
    hasReadingQuiz: true,
    hasIntegratedTask: true,
    content: `Jules Verne viết về cuộc chiến dữ dội giữa đoàn thủy thủ tàu No-ti-lớt và đàn bạch tuộc khổng lồ. Những chiếc vòi dài, lực siết mạnh và sự hung hãn của loài vật biển sâu đã đẩy các thủy thủ vào tình thế sinh tử.

Trong trận chiến, con người thể hiện trí tuệ, lòng dũng cảm và tinh thần đoàn kết để chiến đấu. Tác giả miêu tả bạch tuộc với nhiều chi tiết giàu tính quan sát và gợi hình, đồng thời lồng ghép những kiến thức khoa học về cấu tạo cơ thể mềm, máu xanh và khả năng tiết "mực" đen.

Đoạn trích không chỉ mang màu sắc phiêu lưu, viễn tưởng mà còn ca ngợi vẻ đẹp của con người trước thử thách thiên nhiên khắc nghiệt. Hình ảnh thuyền trưởng Nê-mô ứa lệ trước mất mát đồng đội cũng làm nổi bật chiều sâu tình cảm của nhân vật.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Câu 1: Văn bản Bạch tuộc kể về sự việc chính nào?',
        options: [
          'A. Hành trình của các thuỷ thủ tàu No-ti-lớt trên vùng biển có nhiều quái vật',
          'B. Cuộc chiến đấu giữa đoàn thủy thủ tàu No-ti-lớt và đàn bạch tuộc khổng lồ',
          'C. Thuyền trưởng Nê-mô và các đồng đội dũng cảm chiến đấu chống lại bạch tuộc để trả thù cho bạn',
          'D. Quá trình chinh phục biển cả của đoàn thuỷ thủ thể hiện qua việc tiêu diệt đàn bạch tuộc',
        ],
        correctAnswer: 'B. Cuộc chiến đấu giữa đoàn thủy thủ tàu No-ti-lớt và đàn bạch tuộc khổng lồ',
        order: 1,
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Câu 2: Phương án nào dưới đây nêu đúng về đàn bạch tuộc trong truyện?',
        options: [
          'A. kẻ thù không đội trời chung của con người.',
          'B. lực cản tất yếu của hành trình khám phá biển cả.',
          'C. sức mạnh khủng khiếp thuộc về thế giới tự nhiên.',
          'D. những thử thách mà người thuỷ thủ cần chiến thắng.',
        ],
        correctAnswer: 'C. sức mạnh khủng khiếp thuộc về thế giới tự nhiên.',
        order: 2,
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'Câu 3: Đoạn trích trên cho thấy đặc điểm nổi bật gì ở tác giả?',
        options: [
          'A. Sự đồng cảm đối với thiên nhiên, vạn vật',
          'B. Độ nhạy bén trong quan sát, cảm nhận về đối tượng',
          'C. Khả năng lựa sử dụng ngôn ngữ điêu luy',
          'D. Trí liên tưởng và tưởng tượng phong phú, sắc bén',
        ],
        correctAnswer: 'D. Trí liên tưởng và tưởng tượng phong phú, sắc bén',
        order: 3,
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'Câu 4: Vì sao con bạch tuộc tức giận khi gặp con tàu Nautilus?',
        options: [
          'A. Vì Nautilus to lớn khiến vòi và hai hàm răng của nó chẳng thể tấn công.',
          'B. Vì Nautilus đang săn lùng, tấn công bạch tuộc.',
          'C. Vì Nautilus bắt con của bạch tuộc.',
          'D. Vì Nautilus đâm bạch tuộc bị thương.',
        ],
        correctAnswer: 'D. Vì Nautilus đâm bạch tuộc bị thương.',
        order: 4,
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question:
          'Câu 5: Những chi tiết nào sau đây thể hiện tác giả có những hiểu biết dựa vào thành tựu của khoa học?',
        options: ['A. 1-2-3', 'B. 2-3-4', 'C. 1-2-4', 'D. 1-3-4'],
        correctAnswer: 'D. 1-3-4',
        order: 5,
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'Câu 6: Phương án nào không phải yếu tố giúp đoàn thủy thủ chiến thắng bạch tuộc?',
        options: [
          '1. Sự thông minh',
          '2. Lòng can đảm',
          '3. Sử dụng phương tiện hiện đại',
          '4. Tinh thần đoàn kết',
        ],
        correctAnswer: '3. Sử dụng phương tiện hiện đại',
        order: 6,
      },
      {
        id: 'q7',
        type: 'multiple-choice',
        question:
          'Câu 7: Vẻ đẹp nào của nhân vật thuyền trưởng được thể hiện qua phần văn bản: "Thuyền trưởng Nê-mô, mình nhuốm đầy máu, đứng lặng người bên chiếc đèn pha mà nhìn xuống biển cả vừa nuốt mất một người đồng hương của mình. Mắt Nê-mô ứa lệ."?',
        options: ['A. Anh dũng', 'B. Tài ba', 'C. Giàu tình cảm', 'D. Giàu đức hi sinh'],
        correctAnswer: 'C. Giàu tình cảm',
        order: 7,
      },
      {
        id: 'q8',
        type: 'multiple-choice',
        question: 'Câu 8: Tính chất "viễn tưởng" trong văn bản được thể hiện chủ yếu ở:',
        options: [
          'A. không gian nghệ thuật: cảnh biển hùng tráng, dữ dội và chứa đựng sức mạnh huyền bí.',
          'B. thời gian nghệ thuật: được nén chặt trong cuộc chiến đấu giữa đoàn thuỷ thủ và đàn bạch tuộc.',
          'C. những chi tiết miêu tả về bạch tuộc và cuộc chiến đẫm máu giữa chúng với con người.',
          'D. những sự việc li kì, hấp dẫn diễn ra trong hành trình khám phá biển của đoàn thủy thủ.',
        ],
        correctAnswer: 'C. những chi tiết miêu tả về bạch tuộc và cuộc chiến đẫm máu giữa chúng với con người.',
        order: 8,
      },
      {
        id: 'q9',
        type: 'multiple-choice',
        question:
          'Câu 9: Phương án nào dưới đây nêu đúng nhất về điểm hấp dẫn nổi bật của văn phong trong văn bản Bạch tuộc?',
        options: [
          'A. Sự gay cấn, lôi cuốn.',
          'B. Tính triết lí sâu sắc.',
          'C. Vừa hài hước, vừa thâm thuý.',
          'D. Đậm vẻ chân thực, giản dị.',
        ],
        correctAnswer: 'A. Sự gay cấn, lôi cuốn.',
        order: 9,
      },
      {
        id: 'q10',
        type: 'multiple-choice',
        question: 'Câu 10: Qua văn bản Bạch tuộc, tác giả muốn đề cao điều gì?',
        options: [
          'A. Lối sống nhân ái, bao dung',
          'B. Sức mạnh, trí tuệ của con người',
          'C. Thái độ cảnh giác với động vật',
          'D. Thận trọng khi đi biển',
        ],
        correctAnswer: 'B. Sức mạnh, trí tuệ của con người',
        order: 10,
      },
      {
        id: 'q11',
        type: 'short-answer',
        question:
          'Câu 11: Chỉ ra một yếu tố thú vị về hình thức thể hiện của văn bản và giải thích về sự thú vị đó. Đáp án gợi ý: Đoạn đối thoại giữa 3 nhân vật: Nét, tôi, Công-xây; đoạn đối thoại giữa tôi và thuyền trưởng Nê-mô. Lời thoại ngắn, liên tục, dồn dập theo diễn biến của sự việc, góp phần kéo căng mạch truyện và tạo tính li kì, hấp dẫn.',
        order: 11,
      },
      {
        id: 'q12',
        type: 'short-answer',
        question:
          'Câu 12: Trong truyện, đoàn thủy thủ đã đối mặt với bạch tuộc khổng lồ và nỗ lực vượt qua nghịch cảnh. Em hãy viết đoạn văn khoảng 6-8 câu về một khó khăn em có thể gặp và một điều kì lạ giúp em vượt qua. Gợi ý: khó khăn trong viết văn; điều kì lạ là một cây bút thần có mực là dòng cảm xúc, có ngòi bút là con mắt biết quan sát thấu tỏ mọi việc.',
        order: 12,
      },
    ],
  },
  t_env_02: {
    id: 't_env_02',
    title: 'Giọt nước',
    type: 'Văn bản',
    categoryId: 'env',
    categoryName: 'Giáo dục về môi trường',
    difficulty: null,
    hasReadingQuiz: true,
    hasIntegratedTask: false,
    content: `Giọt nước nhỏ bé lăn trên lá sen, lấp lánh dưới ánh nắng mai. Dù nhỏ bé, nhưng giọt nước ấy chứa đựng cả một thế giới kỳ diệu.

Khi nhiều giọt nước gom lại, chúng tạo thành con suối róc rách, dòng sông mát lành, và đại dương bao la. Nước nuôi sống cây cối, động vật và con người.

Hãy trân trọng từng giọt nước, vì không có nước, sẽ không có sự sống trên Trái Đất này.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Giọt nước trong bài văn lăn trên gì?',
        options: ['Lá cây', 'Lá sen', 'Đất', 'Đá'],
        correctAnswer: 'Lá sen',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'Tại sao chúng ta cần trân trọng từng giọt nước?',
        order: 2,
      },
    ],
  },
  t_env_03: {
    id: 't_env_03',
    title: 'Rừng xanh',
    type: 'Văn bản',
    categoryId: 'env',
    categoryName: 'Giáo dục về môi trường',
    difficulty: 'Dễ',
    hasReadingQuiz: true,
    hasIntegratedTask: true,
    content: `Rừng xanh là lá phổi của Trái Đất. Những tán cây cao vút che phủ mặt đất, tạo bóng mát và không khí trong lành. Trong rừng sống hàng ngàn loài động vật và thực vật, tạo nên một hệ sinh thái phong phú.

Mỗi cây cối đều có vai trò quan trọng. Chúng hấp thụ khí CO2, thải ra oxy, giúp điều hòa khí hậu. Rừng cũng là nơi cung cấp thực phẩm và thuốc men quý giá.

Bảo vệ rừng xanh chính là bảo vệ tương lai của nhân loại.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Rừng xanh được ví như gì?',
        options: ['Tim của Trái Đất', 'Lá phổi của Trái Đất', 'Gan của Trái Đất', 'Não của Trái Đất'],
        correctAnswer: 'Lá phổi của Trái Đất',
        order: 1,
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Cây cối làm gì để giúp điều hòa khí hậu?',
        options: [
          'Hấp thụ oxy, thải ra CO2',
          'Hấp thụ CO2, thải ra oxy',
          'Hấp thụ nước, thải ra khí',
          'Không làm gì cả',
        ],
        correctAnswer: 'Hấp thụ CO2, thải ra oxy',
        order: 2,
      },
      {
        id: 'q3',
        type: 'short-answer',
        question: 'Tại sao bảo vệ rừng xanh là bảo vệ tương lai của nhân loại?',
        order: 3,
      },
    ],
  },
  t_env_04: {
    id: 't_env_04',
    title: 'Biển cả',
    type: 'Văn bản',
    categoryId: 'env',
    categoryName: 'Giáo dục về môi trường',
    difficulty: null,
    hasReadingQuiz: false,
    hasIntegratedTask: true,
    content: `Biển cả mênh mông, sóng vỗ rì rào vào bờ cát trắng. Biển không chỉ đẹp mà còn là nguồn sống của hàng triệu người. Từ biển, con người có thực phẩm, có con đường giao thương, và có nguồn tài nguyên quý giá.

    Nhưng biển đang gặp nguy hiểm. Rác thải nhựa, ô nhiễm dầu, và đánh bắt quá mức đang hủy hoại môi trường biển. Nhiều loài sinh vật biển đang dần tuyệt chủng.

    Chúng ta cần hành động ngay để cứu lấy đại dương xanh.`,
    readingQuestions: [],
    },

    t_env_05: {
    id: 't_env_05',
    title: 'Núi non',
    type: 'Văn bản',
    categoryId: 'env',
    categoryName: 'Giáo dục về môi trường',
    difficulty: 'Trung bình',
    hasReadingQuiz: true,
    hasIntegratedTask: true,
    content: `Núi non chập chùng xa xa, đỉnh núi cao vút lên tận trời xanh. Núi non là biểu tượng của sức mạnh và bền vững. Dù bão tố có dữ dội đến đâu, núi vẫn đứng vững vàng.

    Trên núi có nhiều loài cây quý hiếm, nhiều loài động vật hoang dã. Núi là nguồn nước ngọt cho sông suối, là lá chắn bảo vệ vùng đất thấp khỏi bão lũ.

    Núi non không chỉ đẹp mà còn có vai trò quan trọng trong hệ sinh thái.`,
    readingQuestions: [
        {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Núi non là biểu tượng của gì?',
        options: ['Sự yếu đuối', 'Sức mạnh và bền vững', 'Sự thay đổi', 'Sự mong manh'],
        correctAnswer: 'Sức mạnh và bền vững',
        order: 1,
        },
        {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Vai trò nào KHÔNG phải của núi non?',
        options: [
            'Nguồn nước ngọt',
            'Lá chắn bảo vệ',
            'Tạo ra bão',
            'Nơi sinh sống của động vật',
        ],
        correctAnswer: 'Tạo ra bão',
        order: 2,
        },
        {
        id: 'q3',
        type: 'short-answer',
        question: 'Tại sao núi non quan trọng trong hệ sinh thái?',
        order: 3,
        },
    ],
    },
  t_env_06: {
    id: 't_env_06',
    title: 'Sông suối',
    type: 'Văn bản',
    categoryId: 'env',
    categoryName: 'Giáo dục về môi trường',
    difficulty: null,
    hasReadingQuiz: true,
    hasIntegratedTask: false,
    content: `Sông suối uốn lượn qua núi đồi, mang theo nguồn nước trong lành nuôi sống muôn loài. Tiếng nước chảy róc rách như bài ca của thiên nhiên, êm dịu và bình yên.

Bên bờ suối, cỏ cây xanh tươi, hoa nở rực rỡ. Những con cá nhỏ bơi lội tung tăng trong làn nước trong vắt. Sông suối là nguồn sống của làng mạc, là nơi con người lấy nước sinh hoạt, tưới tiêu cho đồng ruộng.

Chúng ta cần giữ gìn sông suối sạch đẹp để mai sau con cháu vẫn được tận hưởng vẻ đẹp này.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Tiếng nước chảy được ví như gì?',
        options: ['Tiếng hát', 'Bài ca của thiên nhiên', 'Tiếng nhạc', 'Tiếng cười'],
        correctAnswer: 'Bài ca của thiên nhiên',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'Tại sao chúng ta cần giữ gìn sông suối sạch đẹp?',
        order: 2,
      },
    ],
  },
  t_env_07: {
    id: 't_env_07',
    title: 'Khí hậu',
    type: 'Văn bản',
    categoryId: 'env',
    categoryName: 'Giáo dục về môi trường',
    difficulty: 'Khó',
    hasReadingQuiz: true,
    hasIntegratedTask: true,
    content: `Khí hậu của Trái Đất đang thay đổi một cách đáng báo động. Nhiệt độ trung bình tăng cao, băng tan ở hai cực, mực nước biển dâng lên. Đây là hậu quả của việc con người thải quá nhiều khí nhà kính vào bầu khí quyển.

Biến đổi khí hậu gây ra nhiều hậu quả nghiêm trọng: hạn hán kéo dài, lũ lụt, bão tố dữ dội, và nhiều loài sinh vật đang đối mặt với nguy cơ tuyệt chủng.

Mỗi người chúng ta đều có thể góp phần giảm biến đổi khí hậu bằng những hành động nhỏ: tiết kiệm điện, đi xe đạp thay vì xe máy, trồng cây xanh.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Nguyên nhân chính gây biến đổi khí hậu là gì?',
        options: [
          'Núi lửa phun trào',
          'Thải quá nhiều khí nhà kính',
          'Trái Đất già đi',
          'Mặt trời nóng lên',
        ],
        correctAnswer: 'Thải quá nhiều khí nhà kính',
        order: 1,
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Hậu quả nào KHÔNG phải do biến đổi khí hậu?',
        options: [
          'Hạn hán kéo dài',
          'Lũ lụt',
          'Động đất',
          'Bão tố dữ dội',
        ],
        correctAnswer: 'Động đất',
        order: 2,
      },
      {
        id: 'q3',
        type: 'short-answer',
        question: 'Em có thể làm gì để giảm biến đổi khí hậu?',
        order: 3,
      },
    ],
  },
  t_env_08: {
    id: 't_env_08',
    title: 'Sinh thái',
    type: 'Văn bản',
    categoryId: 'env',
    categoryName: 'Giáo dục về môi trường',
    difficulty: null,
    hasReadingQuiz: false,
    hasIntegratedTask: true,
    content: `Hệ sinh thái là một mạng lưới phức tạp, nơi tất cả các sinh vật sống phụ thuộc lẫn nhau. Cây cối cung cấp oxy và thức ăn cho động vật. Động vật giúp thụ phấn cho cây, phân tán hạt giống. Vi khuẩn phân hủy chất hữu cơ, trả lại chất dinh dưỡng cho đất.

    Khi một loài biến mất, toàn bộ hệ sinh thái có thể mất cân bằng. Con người cũng là một phần của hệ sinh thái, và chúng ta có trách nhiệm bảo vệ nó.

    Bảo vệ hệ sinh thái là bảo vệ chính chúng ta.`,
    readingQuestions: [],
    },
    t_peace_01: {
  id: 't_peace_01',
  title: 'Cầu vồng',
  type: 'Sách được chọn',
  categoryId: 'peace',
  categoryName: 'Giáo dục về hòa bình và giải quyết xung đột',
  difficulty: null,
  hasReadingQuiz: false,
  hasIntegratedTask: true,
  content: `Sau cơn mưa, bầu trời xuất hiện một chiếc cầu vồng tuyệt đẹp với bảy màu sắc rực rỡ. Mỗi màu đều có vẻ đẹp riêng, nhưng khi kết hợp lại, chúng tạo nên một kỳ quan thiên nhiên tuyệt vời.

Cầu vồng như một biểu tượng của sự hòa hợp và đoàn kết. Dù khác biệt về màu sắc, nhưng tất cả đều cùng tồn tại hòa bình, tạo nên vẻ đẹp chung.

Chúng ta cũng vậy, mỗi người đều khác biệt, nhưng khi sống hòa bình cùng nhau, chúng ta sẽ tạo nên một thế giới đẹp đẽ hơn.`,
  readingQuestions: [],
},


  t_peace_02: {
    id: 't_peace_02',
    title: 'Hòa bình',
    type: 'Văn bản',
    categoryId: 'peace',
    categoryName: 'Giáo dục về hòa bình và giải quyết xung đột',
    difficulty: 'Trung bình',
    hasReadingQuiz: true,
    hasIntegratedTask: true,
    content: `Hòa bình không chỉ là không có chiến tranh. Hòa bình là khi mọi người sống với nhau trong sự tôn trọng, hiểu biết và yêu thương. Hòa bình bắt đầu từ những việc nhỏ nhất: một nụ cười, một lời chào, một cử chỉ quan tâm.

Để có hòa bình, chúng ta cần học cách lắng nghe, chia sẻ và thấu hiểu. Chúng ta cần đặt mình vào vị trí của người khác để hiểu họ hơn.

Hòa bình là trách nhiệm của tất cả chúng ta.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Hòa bình bắt đầu từ đâu?',
        options: [
          'Từ chính phủ',
          'Từ những việc nhỏ nhất',
          'Từ chiến tranh',
          'Từ trường học',
        ],
        correctAnswer: 'Từ những việc nhỏ nhất',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'Để có hòa bình, chúng ta cần làm gì?',
        order: 2,
      },
    ],
  },
  t_peace_03: {
    id: 't_peace_03',
    title: 'Hợp tác',
    type: 'Văn bản',
    categoryId: 'peace',
    categoryName: 'Giáo dục về hòa bình và giải quyết xung đột',
    difficulty: null,
    hasReadingQuiz: true,
    hasIntegratedTask: false,
    content: `Trong một đàn kiến, mỗi con kiến đều có nhiệm vụ riêng. Có con đi tìm thức ăn, có con bảo vệ tổ, có con chăm sóc trứng. Nhờ hợp tác với nhau, đàn kiến có thể xây dựng những tổ kiến phức tạp và sinh tồn trong môi trường khắc nghiệt.

Con người cũng vậy. Khi chúng ta hợp tác, chúng ta có thể làm được những việc to lớn mà một mình không thể làm được. Hợp tác giúp chúng ta học hỏi lẫn nhau, bổ sung cho nhau, và cùng nhau tiến bộ.

Hãy học cách hợp tác từ những sinh vật nhỏ bé như kiến.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Bài văn lấy ví dụ về con gì?',
        options: ['Ong', 'Kiến', 'Ong bầu', 'Bướm'],
        correctAnswer: 'Kiến',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'Lợi ích của hợp tác là gì?',
        order: 2,
      },
    ],
  },
  t_peace_04: {
    id: 't_peace_04',
    title: 'Đoàn kết',
    type: 'Văn bản',
    categoryId: 'peace',
    categoryName: 'Giáo dục về hòa bình và giải quyết xung đột',
    difficulty: 'Dễ',
    hasReadingQuiz: true,
    hasIntegratedTask: true,
    content: `Có một câu chuyện về bó đũa khó gãy. Một cây đũa thì dễ gãy, nhưng khi bó lại thành một bó, dù có cố gắng đến mấy cũng không thể bẻ gãy.

Đoàn kết cũng vậy. Khi chúng ta đứng một mình, chúng ta yếu đuối. Nhưng khi chúng ta đoàn kết với nhau, chúng ta trở nên mạnh mẽ không gì có thể đánh bại.

Đoàn kết là sức mạnh, là chìa khóa để vượt qua mọi khó khăn.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Câu chuyện trong bài nói về gì?',
        options: ['Bó hoa', 'Bó đũa', 'Bó rơm', 'Bó cỏ'],
        correctAnswer: 'Bó đũa',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'Đoàn kết mang lại điều gì?',
        order: 2,
      },
    ],
  },
  t_peace_05: {
    id: 't_peace_05',
    title: 'Giải quyết xung đột',
    type: 'Văn bản',
    categoryId: 'peace',
    categoryName: 'Giáo dục về hòa bình và giải quyết xung đột',
    difficulty: 'Khó',
    hasReadingQuiz: true,
    hasIntegratedTask: true,
    content: `Xung đột là điều không thể tránh khỏi trong cuộc sống. Khi nhiều người sống cùng nhau, sẽ có lúc ý kiến khác nhau, sẽ có lúc mâu thuẫn xảy ra. Điều quan trọng không phải là tránh xung đột, mà là biết cách giải quyết xung đột một cách hòa bình.

Để giải quyết xung đột, trước tiên chúng ta cần bình tĩnh, lắng nghe quan điểm của người khác. Sau đó, chúng ta cần tìm điểm chung, thỏa hiệp và tìm giải pháp cùng có lợi.

Giải quyết xung đột tốt giúp mối quan hệ trở nên bền chặt hơn.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Điều quan trọng với xung đột là gì?',
        options: [
          'Tránh xung đột',
          'Biết cách giải quyết xung đột',
          'Gây thêm xung đột',
          'Không quan tâm',
        ],
        correctAnswer: 'Biết cách giải quyết xung đột',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'Để giải quyết xung đột, chúng ta cần làm gì?',
        order: 2,
      },
    ],
  },
  t_peace_06: {
  id: 't_peace_06',
  title: 'Văn hóa hòa bình',
  type: 'Sách được chọn',
  categoryId: 'peace',
  categoryName: 'Giáo dục về hòa bình và giải quyết xung đột',
  difficulty: null,
  hasReadingQuiz: false,
  hasIntegratedTask: true,
  content: `Văn hóa hòa bình là khi mọi người tôn trọng sự khác biệt, giải quyết mâu thuẫn bằng đối thoại thay vì bạo lực. Đó là khi trẻ em được dạy về lòng kh관용, sự đồng cảm và trách nhiệm với cộng đồng.

Trong một xã hội có văn hóa hòa bình, người ta không chỉ tránh xung đột mà còn chủ động xây dựng môi trường hòa bình: tổ chức các hoạt động gắn kết cộng đồng, lắng nghe và tôn trọng ý kiến người khác.

Xây dựng văn hóa hòa bình là trách nhiệm của tất cả chúng ta.`,
  readingQuestions: [],
},

t_rights_01: {
id: 't_rights_01',
title: 'Quyền được sống',
type: 'Sách được chọn',
categoryId: 'rights',
categoryName: 'Giáo dục về nhân quyền',
difficulty: null,
hasReadingQuiz: true,
hasIntegratedTask: true,
content: `Mỗi người sinh ra đều có quyền được sống, được tự do và được hạnh phúc. Đây là những quyền cơ bản nhất của con người, không ai có thể tước đoạt.

Quyền được sống nghĩa là được bảo vệ an toàn, được chăm sóc sức khỏe, được ăn uống đầy đủ. Mọi đứa trẻ đều xứng đáng có một tuổi thơ an toàn và hạnh phúc.

Hãy tôn trọng và bảo vệ quyền sống của nhau.`,
readingQuestions: [
    {
    id: 'q1',
    type: 'multiple-choice',
    question: 'Quyền cơ bản nhất của con người là gì?',
    options: [
        'Quyền được giàu có',
        'Quyền được sống, tự do và hạnh phúc',
        'Quyền được nổi tiếng',
        'Quyền được quyền lực',
    ],
    correctAnswer: 'Quyền được sống, tự do và hạnh phúc',
    order: 1,
    },
    {
    id: 'q2',
    type: 'short-answer',
    question: 'Quyền được sống bao gồm những gì?',
    order: 2,
    },
],
},
  t_rights_02: {
    id: 't_rights_02',
    title: 'Bình đẳng',
    type: 'Văn bản',
    categoryId: 'rights',
    categoryName: 'Giáo dục về nhân quyền',
    difficulty: 'Khó',
    hasReadingQuiz: true,
    hasIntegratedTask: false,
    content: `Bình đẳng không có nghĩa là tất cả mọi người giống nhau. Bình đẳng là mọi người đều được đối xử công bằng, đều có cơ hội như nhau để phát triển.

Dù bạn là nam hay nữ, dù bạn sống ở thành phố hay nông thôn, dù gia đình bạn giàu hay nghèo, bạn đều có quyền được học hành, được theo đuổi ước mơ, và được tôn trọng.

Xã hội bình đẳng là xã hội phát triển và văn minh.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Bình đẳng có nghĩa là gì?',
        options: [
          'Mọi người giống nhau',
          'Mọi người được đối xử công bằng',
          'Mọi người giàu như nhau',
          'Mọi người sống cùng nơi',
        ],
        correctAnswer: 'Mọi người được đối xử công bằng',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'Tại sao xã hội bình đẳng là xã hội phát triển?',
        order: 2,
      },
    ],
  },
  t_rights_03: {
    id: 't_rights_03',
    title: 'Tự do',
    type: 'Văn bản',
    categoryId: 'rights',
    categoryName: 'Giáo dục về nhân quyền',
    difficulty: 'Trung bình',
    hasReadingQuiz: true,
    hasIntegratedTask: true,
    content: `Tự do là quyền được sống theo cách riêng của mình, được suy nghĩ, được nói lên ý kiến. Nhưng tự do không có nghĩa là được làm bất cứ điều gì mình muốn.

Tự do đi kèm với trách nhiệm. Tự do của bạn kết thúc ở nơi tự do của người khác bắt đầu. Bạn có quyền tự do, nhưng không có quyền xâm phạm tự do của người khác.

Biết cân bằng giữa tự do và trách nhiệm là dấu hiệu của một con người trưởng thành.`,
    readingQuestions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Tự do đi kèm với điều gì?',
        options: ['Quyền lực', 'Trách nhiệm', 'Tiền bạc', 'Danh vọng'],
        correctAnswer: 'Trách nhiệm',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'Tự do của bạn kết thúc ở đâu?',
        order: 2,
      },
    ],
  },
  t_rights_04: {
    id: 't_rights_04',
    title: 'Nhân quyền phổ quát',
    type: 'Sách được chọn',
    categoryId: 'rights',
    categoryName: 'Giáo dục về nhân quyền',
    difficulty: null,
    hasReadingQuiz: false,
    hasIntegratedTask: true,
    content: `Tuyên ngôn Nhân quyền Phổ quát là văn bản lịch sử, khẳng định rằng tất cả mọi người sinh ra đều tự do và bình đẳng về nhân phẩm và quyền lợi. Không phân biệt chủng tộc, màu da, giới tính, ngôn ngữ, tôn giáo, hay bất kỳ điều kiện nào khác.

    Nhân quyền bao gồm nhiều quyền: quyền được sống, quyền tự do, quyền được học hành, quyền được làm việc, quyền được nghỉ ngơi. Đây là những quyền mà mỗi người đều xứng đáng có được.

    Bảo vệ nhân quyền là bảo vệ phẩm giá con người.`,
    readingQuestions: [],
    },
}

export const fetchTextDetail = async (textId: string): Promise<TextDetail> => {
  console.log('📞 fetchTextDetail called', { textId, useMock })
  
  if (useMock) {
    console.log('✅ Using mock data for text detail')
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const textDetail = mockTextDetails[textId]
    const fallbackDetail: TextDetail = {
      id: textId,
      title: `Văn bản mẫu ${textId}`,
      type: 'Văn bản',
      categoryId: 'env',
      categoryName: 'Thư viện xanh',
      difficulty: 'Trung bình',
      hasReadingQuiz: true,
      hasIntegratedTask: false,
      content: `Đây là ngữ liệu mẫu cho ${textId}. Nội dung này được tạo tự động để hỗ trợ hiển thị khi bạn thêm nhiều sách minh họa.`,
      readingQuestions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Ý chính của đoạn ngữ liệu mẫu là gì?',
          options: ['Mô tả dữ liệu minh họa', 'Phân tích toán học', 'Giải bài tập vật lý', 'Viết thơ'],
          correctAnswer: 'Mô tả dữ liệu minh họa',
          order: 1,
        },
        {
          id: 'q2',
          type: 'short-answer',
          question: 'Em rút ra điều gì từ đoạn ngữ liệu mẫu?',
          order: 2,
        },
      ],
    }

    const resolvedDetail = textDetail || fallbackDetail
    
    console.log('✅ Text detail loaded:', resolvedDetail)
    return resolvedDetail
  }

  const response = await fetch(`${BASE_URL}/api/texts/${textId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch text detail')
  }
  
  return response.json()
}

export const fetchReadingQuestions = async (textId: string): Promise<Question[]> => {
  console.log('📞 fetchReadingQuestions called', { textId, useMock })
  
  if (useMock) {
    console.log('✅ Using mock data for reading questions')
    await new Promise((resolve) => setTimeout(resolve, 200))
    
    const textDetail = mockTextDetails[textId]
    if (textDetail?.readingQuestions) {
      return textDetail.readingQuestions
    }
    return [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Ý chính của đoạn ngữ liệu mẫu là gì?',
        options: ['Mô tả dữ liệu minh họa', 'Phân tích toán học', 'Giải bài tập vật lý', 'Viết thơ'],
        correctAnswer: 'Mô tả dữ liệu minh họa',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer',
        question: 'Em rút ra điều gì từ đoạn ngữ liệu mẫu?',
        order: 2,
      },
    ]
  }

  const response = await fetch(`${BASE_URL}/api/texts/${textId}/reading-questions`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch reading questions')
  }
  
  return response.json()
}

export const submitAnswer = async (data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> => {
  console.log('📞 submitAnswer called', { data, useMock })
  
  if (useMock) {
    console.log('✅ Using mock data for submit answer')
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    const textDetail = mockTextDetails[data.textId]
    const question = textDetail?.readingQuestions?.find(q => q.id === data.questionId)
    
    if (question?.type === 'multiple-choice') {
      const isCorrect = data.answer === question.correctAnswer
      return {
        isCorrect,
        correctAnswer: question.correctAnswer,
        feedback: isCorrect ? 'Chính xác! Bạn làm rất tốt.' : 'Chưa đúng, hãy thử lại nhé!',
      }
    }
    
    return {
      isCorrect: true,
      feedback: 'Cảm ơn bạn đã trả lời. Giáo viên sẽ chấm bài của bạn.',
    }
  }

  const response = await fetch(`${BASE_URL}/api/texts/${data.textId}/submit-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to submit answer')
  }
  
  return response.json()
}

export const submitReadingQuiz = async (
  textId: string,
  answers: Record<string, string>
): Promise<{ score: number; totalQuestions: number; feedback: string }> => {
  console.log('📞 submitReadingQuiz called', { textId, answers, useMock })
  
  if (useMock) {
    console.log('✅ Using mock data for submit quiz')
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    const textDetail = mockTextDetails[textId]
    const questions = textDetail?.readingQuestions || [
      {
        id: 'q1',
        type: 'multiple-choice' as const,
        question: 'Ý chính của đoạn ngữ liệu mẫu là gì?',
        options: ['Mô tả dữ liệu minh họa', 'Phân tích toán học', 'Giải bài tập vật lý', 'Viết thơ'],
        correctAnswer: 'Mô tả dữ liệu minh họa',
        order: 1,
      },
      {
        id: 'q2',
        type: 'short-answer' as const,
        question: 'Em rút ra điều gì từ đoạn ngữ liệu mẫu?',
        order: 2,
      },
    ]
    
    let correctCount = 0
    questions.forEach((q) => {
      if (q.type === 'multiple-choice' && answers[q.id] === q.correctAnswer) {
        correctCount++
      }
    })
    
    const mcQuestions = questions.filter(q => q.type === 'multiple-choice')
    const score = mcQuestions.length > 0 ? Math.round((correctCount / mcQuestions.length) * 100) : 0
    
    return {
      score,
      totalQuestions: questions.length,
      feedback: score >= 70 
        ? 'Xuất sắc! Bạn đã hiểu bài rất tốt.' 
        : score >= 50 
        ? 'Khá tốt! Hãy đọc lại bài để hiểu sâu hơn nhé.' 
        : 'Hãy đọc kỹ bài và thử lại nhé!',
    }
  }

  const response = await fetch(`${BASE_URL}/api/texts/${textId}/submit-quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to submit quiz')
  }
  
  return response.json()
}