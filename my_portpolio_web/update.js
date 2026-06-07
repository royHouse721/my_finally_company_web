const fs = require('fs');

const path = 'c:/Users/고석준/Desktop/my_portpolio_web/business.html';
let content = fs.readFileSync(path, 'utf8');

// Remove cursor and onclick from cards
content = content.replace(/ cursor: pointer;" onclick="showDetail\('[^']+'\)"/g, '"');

// Change margin of use-cases-section
content = content.replace('<section class="use-cases-section">', '<section class="use-cases-section" style="margin-top: 150px;">');

// Extract use-cases-section block
const useCasesStart = content.indexOf('<!-- 적용사례 섹션 -->');
const useCasesEnd = content.indexOf('</section>', useCasesStart) + '</section>'.length;
const useCasesBlock = content.substring(useCasesStart, useCasesEnd);

// Replace detail-section with just the useCasesBlock
const detailStart = content.indexOf('<!-- 클릭 시 나타나는 상세 설명 영역 -->');
const detailEnd = content.indexOf('</div>\r\n    <script>', detailStart); // Actually we can just find </section>\s*</div>
const regex = /<!-- 클릭 시 나타나는 상세 설명 영역 -->[\s\S]*?<\/section>\s*<\/div>/;
content = content.replace(regex, useCasesBlock);

// Remove scripts
content = content.replace(/<script>[\s\S]*?<\/script>/, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Done JS');
