import re

with open('c:/Users/고석준/Desktop/my_portpolio_web/business.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove onclick and cursor:pointer from business-cards
content = re.sub(r'cursor:\s*pointer;[\"\']\s*onclick=[\"\']showDetail\([^\)]+\)', '\"', content)
# Wait, replacing `cursor: pointer;" onclick="showDetail('industrial')` with `"` 
content = content.replace(' cursor: pointer;" onclick="showDetail(\'industrial\')"', '"')
content = content.replace(' cursor: pointer;" onclick="showDetail(\'disaster\')"', '"')
content = content.replace(' cursor: pointer;" onclick="showDetail(\'service\')"', '"')

# Find the use-cases-section
use_cases_match = re.search(r'<!-- 적용사례 섹션 -->.*?<section class=\"use-cases-section\">(.*?)</section>', content, re.DOTALL)
if use_cases_match:
    use_cases = use_cases_match.group(0)
    # Add some margin-top to move it down
    use_cases = use_cases.replace('<section class="use-cases-section">', '<section class="use-cases-section" style="margin-top: 150px;">')
else:
    use_cases = ''

# Remove the detail-section
# detail-section starts at <!-- 클릭 시 나타나는 상세 설명 영역 -->
# and ends after </section> \n    </div>
content = re.sub(r'<!-- 클릭 시 나타나는 상세 설명 영역 -->.*?<div id="detail-section"[^>]*>.*?<!-- 적용사례 섹션 -->.*?</section>\s*</div>', use_cases, content, flags=re.DOTALL)

# Remove the scripts at the bottom
content = re.sub(r'<script>\s*function showDetail.*?function changeTimeline.*?</script>', '', content, flags=re.DOTALL)

with open('c:/Users/고석준/Desktop/my_portpolio_web/business.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
