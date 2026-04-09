type TaskType = 'READING' | 'INTEGRATION'
type LevelScore = 3 | 2 | 1 | 0
const GROUP_LEADER_MEMBER_COUNT = 6
const GROUP_LEADER_TABLE_MIN_WIDTH = 1200

const integrationRubric = [
  {
    title: 'Nội dung (50%)',
    levels: {
      3: [
        'Kết nối nội dung văn bản với vấn đề ESD thiết thực, sáng tạo.',
        'Nội dung sản phẩm có chiều sâu, rút ra thông điệp ý nghĩa, nhân văn; đề xuất được giải pháp cho vấn đề ESD được đặt ra từ văn bản.',
      ],
      2: [
        'Kết nối nội dung văn bản với vấn đề ESD thiết thực, tương đối hợp lí.',
        'Nội dung sản phẩm phù hợp với yêu cầu, tương đối đầy đủ.',
      ],
      1: [
        'Có kết nối nội dung văn bản với vấn đề ESD nhưng chưa cụ thể, đa dạng.',
        'Nội dung còn đơn giản, chưa làm nổi bật được vấn đề.',
      ],
      0: [
        'Thiếu tư duy kết nối ESD hoặc kết nối nội dung văn bản với vấn đề ESD không hợp lí.',
        'Nội dung còn sơ sài, không đúng với yêu cầu.',
      ],
    },
  },
  {
    title: 'Hình thức (30%)',
    levels: {
      3: [
        'Trình bày khoa học, rõ ràng, mạch lạc, có tính thẩm mĩ cao.',
        'Màu sắc hài hòa, có minh họa sinh động, hấp dẫn.',
        'Dễ tiếp cận, thu hút, hấp dẫn.',
      ],
      2: [
        'Trình bày hợp lí, dễ theo dõi.',
        'Có minh họa nhưng chưa thật hấp dẫn.',
        'Hình thức phù hợp với yêu cầu của bài tập dự án tích hợp ESD từ đọc hiểu truyện khoa học viễn tưởng.',
      ],
      1: [
        'Bố cục chưa khoa học, có lỗi nhỏ về kĩ thuật hoặc màu sắc.',
        'Có minh họa, phù hợp với yêu cầu của bài tập dự án tích hợp ESD từ đọc hiểu truyện khoa học viễn tưởng.',
      ],
      0: [
        'Trình bày lộn xộn, bố cục rối.',
        'Sai yêu cầu, không phù hợp với bài tập.',
      ],
    },
  },
  {
    title: 'Sáng tạo (20%)',
    levels: {
      3: [
        'Ý tưởng độc đáo, hình thức mới lạ, tạo dấu ấn riêng.',
        'Sản phẩm thể hiện tư duy sáng tạo rõ rệt, tạo hứng thú.',
      ],
      2: ['Có sáng tạo, sản phẩm gây hứng thú.'],
      1: [
        'Sản phẩm gây hứng thú nhưng mức độ chưa thật sự nổi bật.',
        'Sản phẩm cơ bản rõ ràng nhưng thiếu điểm nhấn, chưa tạo sự khác biệt.',
      ],
      0: ['Trình bày rập khuôn, thiếu ý tưởng mới, sao chép hoặc chưa thể hiện được yếu tố sáng tạo.'],
    },
  },
]

const readingChecklist = [
  'Xác định bối cảnh không gian - thời gian.',
  'Nhận diện yếu tố khoa học - tưởng tượng.',
  'Theo dõi cốt truyện và xung đột.',
  'Hình dung, tưởng tượng rõ ràng về nhân vật (đặc điểm, hành động, phẩm chất).',
  'Phát hiện chi tiết gợi trí tưởng tượng.',
  'Xác định chủ đề và thông điệp của truyện.',
  'Hiểu ý nghĩa biểu tượng của chi tiết/nhân vật.',
  'Có cảm xúc và phản hồi cá nhân sau khi đọc.',
]

const groupLeaderEvaluationCriteria = [
  'Tham gia đầy đủ, đúng giờ, chủ động trong làm việc nhóm. (0-1 điểm)',
  'Có trách nhiệm với nhiệm vụ được giao. (0-2 điểm)',
  'Khả năng hợp tác với các thành viên trong nhóm; biết tôn trọng, lắng nghe ý kiến, tích cực trao đổi, hỗ trợ các thành viên khác. (0-2 điểm)',
  'Mức độ, chất lượng tham gia đóng góp: đưa ra ý tưởng mới, có sáng kiến góp phần nâng cao chất lượng sản phẩm. (0-2 điểm)',
  'Mức độ hoàn thành nhiệm vụ được giao. (0-2 điểm)',
  'Có thái độ nghiêm túc, tích cực, tự tin giao tiếp. (0-2 điểm)',
]

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-left leading-relaxed">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex gap-2">
          <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1f3f8f]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function GroupLeaderEvaluationTable() {
  const memberColumns = Array.from(
    { length: GROUP_LEADER_MEMBER_COUNT },
    (_, index) => `Thành viên ${index + 1}`
  )

  return (
    <div className="space-y-3 rounded-[10px] border border-[#7ea2e0] bg-white p-4 text-[#111]">
      <div className="text-lg font-black text-[#1f3f8f]">
        Phiếu đánh giá làm việc (dành cho nhóm trưởng)
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div>Họ và tên: …………………………………………</div>
        <div>Nhóm trưởng nhóm: …………………………………………</div>
      </div>
      <div className="overflow-x-auto rounded-[10px] border border-[#7ea2e0]">
        <table
          className="w-full border-separate border-spacing-0 text-sm"
          style={{ minWidth: `${GROUP_LEADER_TABLE_MIN_WIDTH}px` }}
        >
          <thead>
            <tr className="text-center font-black text-[#1f3f8f]">
              <th
                rowSpan={2}
                className="w-[70px] border-r border-b border-[#7ea2e0] bg-[#cbeff2] px-2 py-3 align-middle"
              >
                STT
              </th>
              <th
                rowSpan={2}
                className="w-[450px] border-r border-b border-[#7ea2e0] bg-[#cbeff2] px-3 py-3 align-middle"
              >
                Tiêu chí đánh giá
              </th>
              <th colSpan={memberColumns.length} className="border-b border-[#7ea2e0] bg-[#cbeff2] px-3 py-3">
                Tên các thành viên
              </th>
            </tr>
            <tr className="text-center font-semibold text-[#1f3f8f]">
              {memberColumns.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  aria-label={column}
                  className={`${index === memberColumns.length - 1 ? '' : 'border-r'} border-b border-[#7ea2e0] bg-white px-3 py-2`}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {groupLeaderEvaluationCriteria.map((criterion, index) => (
              <tr key={criterion} className="align-top">
                <td className="border-r border-b border-[#7ea2e0] px-2 py-3 text-center font-semibold">{index + 1}</td>
                <td className="border-r border-b border-[#7ea2e0] px-3 py-3">{criterion}</td>
                {memberColumns.map((column, columnIndex) => (
                  <td
                    key={`${column}-${index}`}
                    className={`${columnIndex === memberColumns.length - 1 ? '' : 'border-r'} border-b border-[#7ea2e0] px-3 py-3`}
                  />
                ))}
              </tr>
            ))}
            <tr className="font-bold">
              <td
                colSpan={2}
                className="border-r border-b border-[#7ea2e0] px-3 py-3 text-center text-[#1f3f8f]"
              >
                TỔNG ĐIỂM
              </td>
              {memberColumns.map((column, columnIndex) => (
                <td
                  key={`total-${column}`}
                  className={`${columnIndex === memberColumns.length - 1 ? '' : 'border-r'} border-b border-[#7ea2e0] px-3 py-3`}
                />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="w-full text-left text-sm italic">Nhóm trưởng</div>
    </div>
  )
}

function IntegrationRubricTable() {
  const levelMeta = [
    { score: 3, label: 'Tốt' },
    { score: 2, label: 'Khá' },
    { score: 1, label: 'Đạt' },
    { score: 0, label: 'Chưa đạt' },
  ] as const

  return (
    <div className="overflow-x-auto rounded-[10px] border border-[#7ea2e0] bg-white">
      <table className="min-w-[980px] w-full border-separate border-spacing-0 text-[#111]">
        <thead>
          <tr className="text-center text-lg font-black">
            <th rowSpan={2} className="w-[170px] border-b border-r border-[#7ea2e0] bg-[#cbeff2] px-4 py-4 align-middle">
              Tiêu chí
            </th>
            <th colSpan={4} className="border-b border-[#7ea2e0] bg-[#cbeff2] px-4 py-4">
              Mức độ đạt được
            </th>
          </tr>
          <tr className="text-center text-lg font-black">
            {levelMeta.map((level, index) => (
              <th
                key={level.score}
                className={`${index === 3 ? '' : 'border-r'} border-b border-[#7ea2e0] bg-[#cbeff2] px-4 py-4`}
              >
                <div className="text-2xl leading-none">{level.score}</div>
                <div className="mt-2 text-base">{level.label}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {integrationRubric.map((row) => (
            <tr key={row.title} className="align-top text-[15px] leading-relaxed">
              <td className="border-r border-b border-[#7ea2e0] bg-white px-4 py-4 font-bold">
                {row.title}
              </td>
              {levelMeta.map((level, index) => (
                <td
                  key={level.score}
                  className={`${index === 3 ? '' : 'border-r'} border-b border-[#7ea2e0] bg-white px-4 py-4`}
                >
                  <BulletList items={row.levels[level.score as LevelScore]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReadingRubricTable() {
  const columns = ['Tiêu chí', 'Đã thực hiện', 'Chưa thực hiện', 'Ghi chú']

  return (
    <div className="overflow-x-auto rounded-[28px] border border-[#7ea2e0] bg-white shadow-[0_8px_20px_rgba(31,63,143,0.08)]">
      <table className="min-w-[980px] w-full border-separate border-spacing-0 text-[#1f3f8f]">
        <thead>
          <tr className="text-center text-lg font-black">
            {columns.map((column, index) => (
              <th
                key={column}
                className={`${index === columns.length - 1 ? '' : 'border-r'} border-b border-[#7ea2e0] bg-[#cbeff2] px-4 py-4`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {readingChecklist.map((item) => (
            <tr key={item} className="align-middle text-[15px] leading-relaxed">
              <td className="border-r border-b border-[#7ea2e0] px-4 py-4 text-left">
                {item}
              </td>
              <td className="border-r border-b border-[#7ea2e0] px-4 py-4" />
              <td className="border-r border-b border-[#7ea2e0] px-4 py-4" />
              <td className="border-b border-[#7ea2e0] px-4 py-4" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function RubricTables({ taskType }: { taskType: TaskType }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[#7ea2e0] bg-[#f7fbff] px-4 py-3 text-center text-xl font-black uppercase text-[#1f3f8f] shadow-[0_4px_12px_rgba(31,63,143,0.06)]">
        {taskType === 'READING' ? (
          <>
            <div>BẢNG KIỂM TỰ KIỂM TRA NHIỆM VỤ THỰC HÀNH ĐỌC HIỂU</div>
            <div>VĂN BẢN TRUYỆN KHOA HỌC VIỄN TƯỞNG</div>
          </>
        ) : (
          'RUBRIC ĐÁNH GIÁ BÀI TẬP DỰ ÁN'
        )}
      </div>
      {taskType === 'READING' ? (
        <ReadingRubricTable />
      ) : (
        <>
          <IntegrationRubricTable />
          <GroupLeaderEvaluationTable />
        </>
      )}
    </div>
  )
}
