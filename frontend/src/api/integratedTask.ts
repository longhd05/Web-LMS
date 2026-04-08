import { IntegratedTask, SubmissionFile } from '../types/integratedTask'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const useMock = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

// Mock text content cho tất cả văn bản
const mockTextContent: Record<string, string> = {
  t_env_01: `Ngày xưa, ở một vùng biển xa xôi, có một con bạch tuộc rất thông minh. Con bạch tuộc này có tám chiếc xúc tu dài và linh hoạt, có thể thay đổi màu sắc để hòa mình vào môi trường xung quanh.

Một hôm, con bạch tuộc quyết định khám phá vùng biển mới. Trên đường đi, nó gặp nhiều sinh vật biển khác nhau: cá hề đầy màu sắc, rùa biển già nua, và những rạn san hô tuyệt đẹp.

Con bạch tuộc đã học được rằng sự thông minh và khả năng thích nghi là chìa khóa để sinh tồn trong đại dương rộng lớn. Nó biết cách trốn tránh kẻ thù bằng cách thay đổi màu sắc, biết cách tìm kiếm thức ăn một cách khéo léo, và quan trọng nhất là biết cách sống hòa bình với các sinh vật khác.`,

  t_env_02: `Giọt nước nhỏ bé lăn trên lá sen, lấp lánh dưới ánh nắng mai. Dù nhỏ bé, nhưng giọt nước ấy chứa đựng cả một thế giới kỳ diệu.

Khi nhiều giọt nước gom lại, chúng tạo thành con suối róc rách, dòng sông mát lành, và đại dương bao la. Nước nuôi sống cây cối, động vật và con người.

Hãy trân trọng từng giọt nước, vì không có nước, sẽ không có sự sống trên Trái Đất này.`,

  t_env_03: `Rừng xanh là lá phổi của Trái Đất. Những tán cây cao vút che phủ mặt đất, tạo bóng mát và không khí trong lành. Trong rừng sống hàng ngàn loài động vật và thực vật, tạo nên một hệ sinh thái phong phú.

Mỗi cây cối đều có vai trò quan trọng. Chúng hấp thụ khí CO2, thải ra oxy, giúp điều hòa khí hậu. Rừng cũng là nơi cung cấp thực phẩm và thuốc men quý giá.

Bảo vệ rừng xanh chính là bảo vệ tương lai của nhân loại.`,

  t_env_04: `Biển cả mênh mông, sóng vỗ rì rào vào bờ cát trắng. Biển không chỉ đẹp mà còn là nguồn sống của hàng triệu người. Từ biển, con người có thực phẩm, có con đường giao thương, và có nguồn tài nguyên quý giá.

Nhưng biển đang gặp nguy hiểm. Rác thải nhựa, ô nhiễm dầu, và đánh bắt quá mức đang hủy hoại môi trường biển. Nhiều loài sinh vật biển đang dần tuyệt chủng.

Chúng ta cần hành động ngay để cứu lấy đại dương xanh.`,

  t_env_05: `Núi non chập chùng xa xa, đỉnh núi cao vút lên tận trời xanh. Núi non là biểu tượng của sức mạnh và bền vững. Dù bão tố có dữ dội đến đâu, núi vẫn đứng vững vàng.

Trên núi có nhiều loài cây quý hiếm, nhiều loài động vật hoang dã. Núi là nguồn nước ngọt cho sông suối, là lá chắn bảo vệ vùng đất thấp khỏi bão lũ.

Núi non không chỉ đẹp mà còn có vai trò quan trọng trong hệ sinh thái.`,

  t_env_06: `Sông suối uốn lượn qua núi đồi, mang theo nguồn nước trong lành nuôi sống muôn loài. Tiếng nước chảy róc rách như bài ca của thiên nhiên, êm dịu và bình yên.

Bên bờ suối, cỏ cây xanh tươi, hoa nở rực rỡ. Những con cá nhỏ bơi lội tung tăng trong làn nước trong vắt. Sông suối là nguồn sống của làng mạc, là nơi con người lấy nước sinh hoạt, tưới tiêu cho đồng ruộng.

Chúng ta cần giữ gìn sông suối sạch đẹp để mai sau con cháu vẫn được tận hưởng vẻ đẹp này.`,

  t_env_07: `Khí hậu của Trái Đất đang thay đổi một cách đáng báo động. Nhiệt độ trung bình tăng cao, băng tan ở hai cực, mực nước biển dâng lên. Đây là hậu quả của việc con người thải quá nhiều khí nhà kính vào bầu khí quyển.

Biến đổi khí hậu gây ra nhiều hậu quả nghiêm trọng: hạn hán kéo dài, lũ lụt, bão tố dữ dội, và nhiều loài sinh vật đang đối mặt với nguy cơ tuyệt chủng.

Mỗi người chúng ta đều có thể góp phần giảm biến đổi khí hậu bằng những hành động nhỏ: tiết kiệm điện, đi xe đạp thay vì xe máy, trồng cây xanh.`,

  t_env_08: `Hệ sinh thái là một mạng lưới phức tạp, nơi tất cả các sinh vật sống phụ thuộc lẫn nhau. Cây cối cung cấp oxy và thức ăn cho động vật. Động vật giúp thụ phấn cho cây, phân tán hạt giống. Vi khuẩn phân hủy chất hữu cơ, trả lại chất dinh dưỡng cho đất.

Khi một loài biến mất, toàn bộ hệ sinh thái có thể mất cân bằng. Con người cũng là một phần của hệ sinh thái, và chúng ta có trách nhiệm bảo vệ nó.

Bảo vệ hệ sinh thái là bảo vệ chính chúng ta.`,

  t_peace_01: `Sau cơn mưa, bầu trời xuất hiện một chiếc cầu vồng tuyệt đẹp với bảy màu sắc rực rỡ. Mỗi màu đều có vẻ đẹp riêng, nhưng khi kết hợp lại, chúng tạo nên một kỳ quan thiên nhiên tuyệt vời.

Cầu vồng như một biểu tượng của sự hòa hợp và đoàn kết. Dù khác biệt về màu sắc, nhưng tất cả đều cùng tồn tại hòa bình, tạo nên vẻ đẹp chung.

Chúng ta cũng vậy, mỗi người đều khác biệt, nhưng khi sống hòa bình cùng nhau, chúng ta sẽ tạo nên một thế giới đẹp đẽ hơn.`,

  t_peace_02: `Hòa bình không chỉ là không có chiến tranh. Hòa bình là khi mọi người sống với nhau trong sự tôn trọng, hiểu biết và yêu thương. Hòa bình bắt đầu từ những việc nhỏ nhất: một nụ cười, một lời chào, một cử chỉ quan tâm.

Để có hòa bình, chúng ta cần học cách lắng nghe, chia sẻ và thấu hiểu. Chúng ta cần đặt mình vào vị trí của người khác để hiểu họ hơn.

Hòa bình là trách nhiệm của tất cả chúng ta.`,

  t_peace_03: `Trong một đàn kiến, mỗi con kiến đều có nhiệm vụ riêng. Có con đi tìm thức ăn, có con bảo vệ tổ, có con chăm sóc trứng. Nhờ hợp tác với nhau, đàn kiến có thể xây dựng những tổ kiến phức tạp và sinh tồn trong môi trường khắc nghiệt.

Con người cũng vậy. Khi chúng ta hợp tác, chúng ta có thể làm được những việc to lớn mà một mình không thể làm được. Hợp tác giúp chúng ta học hỏi lẫn nhau, bổ sung cho nhau, và cùng nhau tiến bộ.

Hãy học cách hợp tác từ những sinh vật nhỏ bé như kiến.`,

  t_peace_04: `Có một câu chuyện về bó đũa khó gãy. Một cây đũa thì dễ gãy, nhưng khi bó lại thành một bó, dù có cố gắng đến mấy cũng không thể bẻ gãy.

Đoàn kết cũng vậy. Khi chúng ta đứng một mình, chúng ta yếu đuối. Nhưng khi chúng ta đoàn kết với nhau, chúng ta trở nên mạnh mẽ không gì có thể đánh bại.

Đoàn kết là sức mạnh, là chìa khóa để vượt qua mọi khó khăn.`,

  t_peace_05: `Xung đột là điều không thể tránh khỏi trong cuộc sống. Khi nhiều người sống cùng nhau, sẽ có lúc ý kiến khác nhau, sẽ có lúc mâu thuẫn xảy ra. Điều quan trọng không phải là tránh xung đột, mà là biết cách giải quyết xung đột một cách hòa bình.

Để giải quyết xung đột, trước tiên chúng ta cần bình tĩnh, lắng nghe quan điểm của người khác. Sau đó, chúng ta cần tìm điểm chung, thỏa hiệp và tìm giải pháp cùng có lợi.

Giải quyết xung đột tốt giúp mối quan hệ trở nên bền chặt hơn.`,

  t_peace_06: `Văn hóa hòa bình là khi mọi người tôn trọng sự khác biệt, giải quyết mâu thuẫn bằng đối thoại thay vì bạo lực. Đó là khi trẻ em được dạy về lòng khoan dung, sự đồng cảm và trách nhiệm với cộng đồng.

Trong một xã hội có văn hóa hòa bình, người ta không chỉ tránh xung đột mà còn chủ động xây dựng môi trường hòa bình: tổ chức các hoạt động gắn kết cộng đồng, lắng nghe và tôn trọng ý kiến ng��ời khác.

Xây dựng văn hóa hòa bình là trách nhiệm của tất cả chúng ta.`,

  t_rights_01: `Mỗi người sinh ra đều có quyền được sống, được tự do và được hạnh phúc. Đây là những quyền cơ bản nhất của con người, không ai có thể tước đoạt.

Quyền được sống nghĩa là được bảo vệ an toàn, được chăm sóc sức khỏe, được ăn uống đầy đủ. Mọi đứa trẻ đều xứng đáng có một tuổi thơ an toàn và hạnh phúc.

Hãy tôn trọng và bảo vệ quyền sống của nhau.`,

  t_rights_02: `Bình đẳng không có nghĩa là tất cả mọi người giống nhau. Bình đẳng là mọi người đều được đối xử công bằng, đều có cơ hội như nhau để phát triển.

Dù bạn là nam hay nữ, dù bạn sống ở thành phố hay nông thôn, dù gia đình bạn giàu hay nghèo, bạn đều có quyền được học hành, được theo đuổi ước mơ, và được tôn trọng.

Xã hội bình đẳng là xã hội phát triển và văn minh.`,

  t_rights_03: `Tự do là quyền được sống theo cách riêng của mình, được suy nghĩ, được nói lên ý kiến. Nhưng tự do không có nghĩa là được làm bất cứ điều gì mình muốn.

Tự do đi kèm với trách nhiệm. Tự do của bạn kết thúc ở nơi tự do của người khác bắt đầu. Bạn có quyền tự do, nhưng không có quyền xâm phạm tự do của người khác.

Biết cân bằng giữa tự do và trách nhiệm là dấu hiệu của một con người trưởng thành.`,

  t_rights_04: `Tuyên ngôn Nhân quyền Phổ quát là văn bản lịch sử, khẳng định rằng tất cả mọi người sinh ra đều tự do và bình đẳng về nhân phẩm và quyền lợi. Không phân biệt chủng tộc, màu da, giới tính, ngôn ngữ, tôn giáo, hay bất kỳ điều kiện nào khác.

Nhân quyền bao gồm nhiều quyền: quyền được sống, quyền tự do, quyền được học hành, quyền được làm việc, quyền được nghỉ ngơi. Đây là những quyền mà mỗi người đều xứng đáng có được.

Bảo vệ nhân quyền là bảo vệ phẩm giá con người.`,
}

// Mock integrated tasks cho TẤT CẢ văn bản có hasIntegratedTask = true
const mockIntegratedTasks: Record<string, IntegratedTask> = {
  t_env_01: {
    id: 'task_env_01',
    textId: 't_env_01',
    prompt: `***Nhiệm vụ cá nhân:***
***Bài 1: Hãy đọc kĩ lại văn bản, kết hợp với việc tìm hiểu trên mạng internet, trả lời các câu hỏi sau:***
Câu 1: Em hãy tìm hiểu về vai trò của các loài sinh vật biển trong hệ sinh thái và cho biết vì sao cần bảo vệ chúng.
Câu 2: Chi tiết thuyền trưởng Nê-mô "mình nhuốm đầy máu, đứng lặng người" và "ứa lệ" khi nhìn xuống biển cả sau cuộc giáp chiến giúp em hiểu thêm điều gì về thái độ của ông đối với con người và đại dương?
Câu 3: Theo em, việc tiêu diệt bạch tuộc có thể giúp chấm dứt hoàn toàn cuộc chiến giữa con người và sinh vật biển không?
Câu 4: Văn bản *"Bạch tuộc"* kể lại cuộc chiến đấu không khoan nhượng giữa những thủy thủ và đàn bạch tuộc. Nhưng có ý kiến lại cho rằng, con người không nên tiêu diệt động vật hoang dã mà hãy tìm cách chung sống với chúng. Em có suy nghĩ gì về quan điểm trên?
Câu 5: Từ câu chuyện trong văn bản, em rút ra bài học gì về cách ứng xử của con người với đại dương?
***Bài 2:***
Trận chiến khốc liệt với đàn bạch tuộc đã để lại nỗi đau thắt lòng cho thuyền trưởng Nê-mô khi mất đi người đồng hương, đồng thời cũng khiến những sinh vật biển phải chịu thương vong nặng nề. Điều đó cho thấy, xung đột giữa người và động vật hoang dã đã và đang là một trong những mối đe dọa lớn nhất đối với sự sinh tồn lâu dài của một số loài sinh vật thế giới như hổ, sói, voi, cá sấu, bạch tuộc,... Tuy nhiên, chính bằng công nghệ hiện đại, chúng ta hoàn toàn có thể hóa giải các mâu thuẫn mà không cần dùng đến vũ lực để hướng đến một tương lai cho sự chung sống hài hòa giữa con người và động vật hoang dã.
Đọc bài báo sau để biết thêm thông tin: https://tapchimoitruong.vn/chuyen-muc-3/mot-tuong-lai-cho-su-chung-song-hai-hoa-giua-con-nguoi-va-dong-vat-hoang-da-25602.
Từ đó, hãy đóng vai một nhà môi trường học đến từ tương lai, viết một lá thư gửi thuyền trưởng Nê-mô, thuyết phục ông nghiên cứu các thiết bị công nghệ (như radar quét sinh cảnh tầm xa, hệ thống phát sóng siêu âm điều chỉnh hành vi,...) để tàu No-ti-lớt không gây ra những tổn thương đến hệ sinh thái biển cả.

***Nhiệm vụ làm việc nhóm:***
**Bài tập dự án:** Từ cuộc chiến đẫm máu giữa bạch tuộc và đoàn thủy thủ, chúng ta thấy được những mất mát, thương đau mà cả con người và thiên nhiên đều phải gánh chịu. Điều đó khiến chúng ta cần suy nghĩ lại về cách con người ứng xử với đại dương. Hãy thiết kế một số báo với chủ đề: *"Khi đại dương không chỉ là nơi để chinh phục"*

Yêu cầu
*Về nội dung của số báo:*
- **Góc suy ngẫm:** bài viết thể hiện suy nghĩ về hành động của con người trong các cuộc chiến với thiên nhiên sau khi đọc hiểu văn bản, từ đó đưa ra quan điểm về cách ứng xử với sinh vật biển.
- **Góc khám phá:** điều tra, khảo sát về thực trạng của các loài sinh vật biển hiện nay; tìm hiểu và giới thiệu một số ứng dụng công nghệ được sử dụng để bảo vệ sinh vật biển.
- **Góc sáng tạo:** sáng tạo các sản phẩm (thư, truyện ngắn, nhật kí, tranh ảnh,...) thể hiện khát vọng con người không đối đầu với đại dương mà biết cách chung sống hài hòa, gửi gắm thông điệp về trách nhiệm bảo vệ môi trường biển.

*Về hình thức:*
- Số báo được trình bày bằng định dạng file PDF
- Có đầy đủ các phần (trang bìa, mục lục, các chuyên mục)
- Trong các chuyên mục, có sự kết hợp hài hòa giữa văn bản, hình ảnh, sơ đồ, infographic,...
- Bố cục khoa học, có tính thẩm mĩ.

***Gợi ý một số công cụ hỗ trợ:***
- Viết/biên tập văn bản (Microsoft Word, Google Docs)
- Thiết kế đồ họa (Canva, Adobe InDesign)
- Chỉnh sửa hình ảnh (Adobe Photoshop, GIMP)
- Tạo video/đồ họa (Adobe Spark)
- Tạo infographic (Piktochart)`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
    dueDate: '2026-03-15T23:59:59',
  },

  t_env_02: {
    id: 'task_env_02',
    textId: 't_env_02',
    prompt: `Sau khi đọc "Giọt nước", viết về:

"Tầm quan trọng của nước và tiết kiệm nước"

Yêu cầu:
- Giải thích vai trò của nước trong cuộc sống
- Phân tích tình trạng khan hiếm nước
- Đề xuất cách tiết kiệm nước hàng ngày`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_env_03: {
    id: 'task_env_03',
    textId: 't_env_03',
    prompt: `Sau khi đọc văn bản "Rừng xanh", hãy viết bài luận về:

"Vai trò của rừng và trách nhiệm bảo vệ rừng"

Yêu cầu:
- Phân tích vai trò của rừng đối với môi trường
- Nêu những nguy cơ rừng đang gặp phải
- Đề xuất giải pháp bảo vệ rừng`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
    dueDate: '2026-03-18T23:59:59',
  },

  t_env_04: {
    id: 'task_env_04',
    textId: 't_env_04',
    prompt: `Dựa vào bài "Biển cả", viết bài văn về:

"Ô nhiễm biển và cách khắc phục"

Yêu cầu:
- Mô tả tình trạng ô nhiễm biển hiện nay
- Phân tích nguyên nhân và hậu quả
- Đề xuất hành động cụ thể để bảo vệ biển`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
    dueDate: '2026-03-20T23:59:59',
  },

  t_env_05: {
    id: 'task_env_05',
    textId: 't_env_05',
    prompt: `Sau khi đọc "Núi non", hãy viết về:

"Vẻ đẹp của thiên nhiên và trách nhiệm bảo vệ"

Yêu cầu:
- Miêu tả vẻ đẹp của núi non
- Nêu tầm quan trọng của việc bảo vệ cảnh quan
- Chia sẻ trải nghiệm hoặc suy nghĩ cá nhân`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_env_06: {
    id: 'task_env_06',
    textId: 't_env_06',
    prompt: `Dựa vào "Sông suối", viết về:

"Bảo vệ nguồn nước sạch"

Yêu cầu:
- Mô tả vai trò của sông suối
- Phân tích nguyên nhân ô nhiễm nguồn nước
- Đề xuất giải pháp bảo vệ`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_env_07: {
    id: 'task_env_07',
    textId: 't_env_07',
    prompt: `Dựa vào văn bản "Khí hậu", viết luận về:

"Biến đổi khí hậu và hành động của chúng ta"

Yêu cầu:
- Giải thích hiện tượng biến đổi khí hậu
- Phân tích tác động đến con người và môi trường
- Đề xuất hành động cá nhân để giảm phát thải`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_env_08: {
    id: 'task_env_08',
    textId: 't_env_08',
    prompt: `Sau khi đọc "Sinh thái", viết về:

"Cân bằng sinh thái và vai trò của con người"

Yêu cầu:
- Giải thích khái niệm cân bằng sinh thái
- Phân tích tác động của con người
- Đề xuất cách sống hài hòa với thiên nhiên`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_peace_01: {
    id: 'task_peace_01',
    textId: 't_peace_01',
    prompt: `Sau khi đọc văn bản "Cầu vồng", hãy viết một bài luận về:

"Ý nghĩa của sự đa dạng và hòa hợp trong cuộc sống"

Hướng dẫn:
- So sánh cầu vồng với xã hội đa văn hóa
- Đưa ra ví dụ thực tế về sự hòa hợp
- Đề xuất cách để tạo ra một cộng đồng hòa bình`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
    dueDate: '2026-03-20T23:59:59',
  },

  t_peace_02: {
    id: 'task_peace_02',
    textId: 't_peace_02',
    prompt: `Dựa vào bài "Hòa bình", viết về:

"Hòa bình bắt đầu từ mỗi chúng ta"

Yêu cầu:
- Giải thích ý nghĩa thật sự của hòa bình
- Nêu ví dụ về hành động tạo hòa bình trong cuộc sống
- Cam kết cá nhân vì một thế giới hòa bình`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_peace_03: {
    id: 'task_peace_03',
    textId: 't_peace_03',
    prompt: `Sau khi đọc "Hợp tác", viết về:

"Tinh thần hợp tác trong học tập"

Yêu cầu:
- Giải thích lợi ích của hợp tác
- Nêu ví dụ về hợp tác thành công
- Đề xuất cách thúc đẩy hợp tác`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_peace_04: {
    id: 'task_peace_04',
    textId: 't_peace_04',
    prompt: `Sau khi đọc "Đoàn kết", viết về:

"Sức mạnh của đoàn kết và hợp tác"

Yêu cầu:
- Phân tích tầm quan trọng của đoàn kết
- Đưa ra ví dụ thực tế
- Đề xuất cách thúc đẩy tinh thần đoàn kết`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_peace_05: {
    id: 'task_peace_05',
    textId: 't_peace_05',
    prompt: `Dựa vào "Giải quyết xung đột", viết về:

"Nghệ thuật giải quyết mâu thuẫn"

Yêu cầu:
- Phân tích nguyên nhân của xung đột
- Trình bày các phương pháp giải quyết
- Chia sẻ kinh nghiệm cá nhân`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_peace_06: {
    id: 'task_peace_06',
    textId: 't_peace_06',
    prompt: `Sau khi đọc "Văn hóa hòa bình", viết về:

"Xây dựng văn hóa hòa bình trong trường học"

Yêu cầu:
- Giải thích khái niệm văn hóa hòa bình
- Đề xuất hoạt động xây dựng văn hóa hòa bình
- Nêu lợi ích của môi trường học tập hòa bình`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_rights_01: {
    id: 'task_rights_01',
    textId: 't_rights_01',
    prompt: `Dựa vào "Quyền được sống", viết về:

"Quyền sống và bảo vệ trẻ em"

Yêu cầu:
- Giải thích quyền được sống của trẻ em
- Phân tích các mối đe dọa đến quyền sống
- Đề xuất cách bảo vệ quyền trẻ em`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_rights_02: {
    id: 'task_rights_02',
    textId: 't_rights_02',
    prompt: `Dựa vào "Bình đẳng", viết về:

"Bình đẳng giới trong xã hội hiện đại"

Yêu cầu:
- Giải thích khái niệm bình đẳng giới
- Phân tích tình trạng bất bình đẳng
- Đề xuất giải pháp thúc đẩy bình đẳng`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_rights_03: {
    id: 'task_rights_03',
    textId: 't_rights_03',
    prompt: `Sau khi đọc "Tự do", viết về:

"Tự do và trách nhiệm"

Yêu cầu:
- Giải thích khái niệm tự do
- Phân tích mối quan hệ giữa tự do và trách nhiệm
- Nêu ví dụ về việc thực hiện quyền tự do có trách nhiệm`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },

  t_rights_04: {
    id: 'task_rights_04',
    textId: 't_rights_04',
    prompt: `Dựa vào "Nhân quyền phổ quát", viết về:

"Nhân quyền trong cuộc sống hàng ngày"

Yêu cầu:
- Giải thích các quyền cơ bản của con người
- Nêu ví dụ về việc tôn trọng nhân quyền
- Đề xuất hành động để bảo vệ nhân quyền`,
    maxFileSize: 5,
    allowedFileTypes: ['pdf', 'docx', 'doc', 'txt'],
  },
}

// Mock titles
const mockTextTitles: Record<string, string> = {
  t_env_01: 'Bạch tuộc',
  t_env_02: 'Giọt nước',
  t_env_03: 'Rừng xanh',
  t_env_04: 'Biển cả',
  t_env_05: 'Núi non',
  t_env_06: 'Sông suối',
  t_env_07: 'Khí hậu',
  t_env_08: 'Sinh thái',
  t_peace_01: 'Cầu vồng',
  t_peace_02: 'Hòa bình',
  t_peace_03: 'Hợp tác',
  t_peace_04: 'Đoàn kết',
  t_peace_05: 'Giải quyết xung đột',
  t_peace_06: 'Văn hóa hòa bình',
  t_rights_01: 'Quyền được sống',
  t_rights_02: 'Bình đẳng',
  t_rights_03: 'Tự do',
  t_rights_04: 'Nhân quy��n phổ quát',
}

export const fetchIntegratedTask = async (textId: string): Promise<{
  task: IntegratedTask
  textContent: string
  textTitle: string
}> => {
  console.log('📞 fetchIntegratedTask called', { textId, useMock })
  
  if (useMock) {
    console.log('✅ Using mock data for integrated task')
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const task = mockIntegratedTasks[textId]
    const textContent = mockTextContent[textId]
    const textTitle = mockTextTitles[textId]
    
    if (!task) {
      console.error('❌ No integrated task found for:', textId)
      throw new Error(`Văn bản "${textTitle || textId}" không có bài tập tích hợp`)
    }
    
    if (!textContent) {
      console.error('❌ No text content found for:', textId)
      throw new Error(`Không tìm thấy nội dung văn bản`)
    }
    
    console.log('✅ Task loaded:', { textId, taskId: task.id, textTitle })
    
    return {
      task,
      textContent,
      textTitle: textTitle || 'Văn bản',
    }
  }

  const response = await fetch(`${BASE_URL}/texts/${textId}/integrated-task`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch integrated task')
  }
  
  return response.json()
}

export const uploadSubmission = async (
  taskId: string,
  file: File
): Promise<SubmissionFile> => {
  console.log('📞 uploadSubmission called', { taskId, fileName: file.name, fileSize: file.size, useMock })
  
  if (useMock) {
    console.log('✅ Using mock data for upload submission')
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    return {
      id: 'sub_' + Date.now(),
      taskId,
      studentId: 'student_123',
      fileName: file.name,
      fileSize: file.size,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      status: 'pending',
    }
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('taskId', taskId)

  const token = localStorage.getItem('auth_token')
  const response = await fetch(`${BASE_URL}/integrated-tasks/${taskId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload submission')
  }
  
  return response.json()
}

export const fetchMySubmissions = async (taskId: string): Promise<SubmissionFile[]> => {
  console.log('📞 fetchMySubmissions called', { taskId, useMock })
  
  if (useMock) {
    console.log('✅ Using mock data for submissions')
    await new Promise((resolve) => setTimeout(resolve, 200))
    
    return []
  }

  const token = localStorage.getItem('auth_token')
  const response = await fetch(`${BASE_URL}/integrated-tasks/${taskId}/my-submissions`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch submissions')
  }
  
  return response.json()
}
