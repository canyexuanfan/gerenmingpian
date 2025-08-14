// 全局变量存储当前名片数据
let currentCardData = {};
let generatedCardQRCode = null; // 存储程序生成的名片内容二维码

// 生成名片函数
function generateCard() {
    // 获取表单数据
    const name = document.getElementById('name').value || '您的姓名';
    const phone = document.getElementById('phone').value || '您的手机号';
    const email = document.getElementById('email').value || '您的邮箱';
    const company = document.getElementById('company').value || '您的公司';
    const location = document.getElementById('location').value || '您的地点';
    const title = document.getElementById('title').value || '您的身份标签';
    const avatar = document.getElementById('avatar').value;
    const highlights = document.getElementById('highlights').value;
    const skills = document.getElementById('skills').value;
    const interests = document.getElementById('interests').value;
    const motto = document.getElementById('motto').value || '您的个人态度';

    // 保存当前名片数据
    currentCardData = { name, phone, email, company, location, title, avatar, highlights, skills, interests, motto };

    // 更新名片内容
    updateCardContent(name, phone, email, company, location, title, avatar, highlights, skills, interests, motto);
    
    // 滚动到名片预览区域
    document.getElementById('businessCard').scrollIntoView({ behavior: 'smooth' });
}

// 更新名片内容
function updateCardContent(name, phone, email, company, location, title, avatar, highlights, skills, interests, motto) {
    // 更新基本信息
    document.getElementById('cardName').textContent = name;
    document.getElementById('cardPhone').innerHTML = `<i class="fas fa-phone mr-1"></i>${phone}`;
    document.getElementById('cardEmail').innerHTML = `<i class="fas fa-envelope mr-1"></i>${email}`;
    document.getElementById('cardCompany').innerHTML = `<i class="fas fa-building mr-1"></i>${company}`;
    document.getElementById('cardLocation').innerHTML = `<i class="fas fa-map-marker-alt mr-1"></i>${location}`;
    document.getElementById('cardTitle').textContent = title;
    
    // 更新头像
    updateAvatar(avatar);
    
    // 更新履历亮点
    updateListContent('cardHighlights', highlights, '请填写您的履历亮点');
    
    // 更新擅长领域
    updateListContent('cardSkills', skills, '请填写您的专业技能');
    
    // 更新兴趣爱好
    updateListContent('cardInterests', interests, '请填写您的兴趣爱好');
    
    // 更新个人态度
    document.getElementById('cardMotto').textContent = `"${motto}"`;
}

// 更新头像显示
function updateAvatar(avatarUrl) {
    const cardAvatar = document.getElementById('cardAvatar');
    const defaultAvatar = document.getElementById('defaultAvatar');
    
    if (avatarUrl && (isValidUrl(avatarUrl) || avatarUrl.startsWith('data:'))) {
        cardAvatar.src = avatarUrl;
        cardAvatar.classList.remove('hidden');
        defaultAvatar.classList.add('hidden');
    } else {
        cardAvatar.classList.add('hidden');
        defaultAvatar.classList.remove('hidden');
    }
}

// 更新列表内容
function updateListContent(elementId, content, placeholder) {
    const element = document.getElementById(elementId);
    
    if (content.trim()) {
        const items = content.split('\n').filter(item => item.trim());
        element.innerHTML = items.map(item => `<li>• ${item.trim()}</li>`).join('');
    } else {
        element.innerHTML = `<li>• ${placeholder}</li>`;
    }
}

// 验证URL格式
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// 使用html2canvas下载PNG格式名片
function downloadCardAsPNG() {
    const name = document.getElementById('name').value;
    if (!name.trim()) {
        alert('请先填写姓名信息！');
        return;
    }
    
    const card = document.getElementById('businessCard');
    
    // 显示加载提示
    const loadingBtn = event.target;
    const originalText = loadingBtn.innerHTML;
    loadingBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
    loadingBtn.disabled = true;
    
    // 使用html2canvas直接截取名片
    html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true
    }).then(canvas => {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `${name}-个人名片.png`;
        link.href = canvas.toDataURL('image/png');
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 恢复按钮状态
        loadingBtn.innerHTML = originalText;
        loadingBtn.disabled = false;
        
        // 显示成功提示
        showNotification('名片下载成功！', 'success');
    }).catch(error => {
        console.error('下载失败:', error);
        loadingBtn.innerHTML = originalText;
        loadingBtn.disabled = false;
        showNotification('下载失败：' + error.message, 'error');
    });
}

// 处理头像文件上传
function handleAvatarUpload() {
    const fileInput = document.getElementById('avatarFile');
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB限制
                alert('头像文件大小不能超过5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const avatarUrl = e.target.result;
                document.getElementById('avatar').value = avatarUrl;
                updateAvatar(avatarUrl);
                // 触发实时预览更新
                triggerCardUpdate();
            };
            reader.readAsDataURL(file);
        }
    });
}

// 处理二维码文件上传
function handleQRCodeUpload() {
    const fileInput = document.getElementById('qrcodeFile');
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB限制
                alert('二维码文件大小不能超过2MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                updateQRCode(e.target.result);
                showNotification('二维码上传成功！', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
}

// 生成名片内容二维码（使用Python后端）
async function generateCardQRCode() {
    console.log('=== 开始生成名片二维码（后端方案）===');
    
    try {
        // 1. 检查姓名输入
        const nameInput = document.getElementById('name');
        if (!nameInput) {
            throw new Error('找不到姓名输入框');
        }
        
        const name = nameInput.value.trim();
        if (!name) {
            alert('请先填写姓名信息！');
            return;
        }
        
        console.log('姓名:', name);
        
        // 2. 收集完整名片信息
         const location = document.getElementById('location')?.value?.trim() || '';
         const title = document.getElementById('title')?.value?.trim() || '';
         const highlights = document.getElementById('highlights')?.value?.trim() || '';
         const skills = document.getElementById('skills')?.value?.trim() || '';
         const interests = document.getElementById('interests')?.value?.trim() || '';
         const motto = document.getElementById('motto')?.value?.trim() || '';
         
         // 3. 使用中文标签格式
          let cardText = `姓名: ${name}`;
          
          if (title) {
              cardText += `\n职位: ${title}`;
          }
          
          if (location) {
              cardText += `\n地点: ${location}`;
          }
          
          const phoneNumber = document.getElementById('phone')?.value?.trim() || '';
          const email = document.getElementById('email')?.value?.trim() || '';
          
          if (phoneNumber) {
              cardText += `\n电话: ${phoneNumber}`;
          }
          
          if (email) {
              cardText += `\n邮箱: ${email}`;
          }
          
          console.log('生成的名片文本:', cardText);
          console.log('文本长度:', cardText.length);
         
         // 4. 调用Python后端MeCard API
          try {
               console.log('调用后端MeCard API生成二维码');
               
               // 显示加载状态
               showNotification('正在生成名片二维码（MeCard格式）...', 'info');
               
               // 提取名片字段信息
               const cardFields = {
                   name: document.getElementById('name')?.value?.trim() || '',
                   phone: document.getElementById('phone')?.value?.trim() || '',
                   email: document.getElementById('email')?.value?.trim() || '',
                   org: document.getElementById('company')?.value?.trim() || '',
                   title: document.getElementById('title')?.value?.trim() || '',
                   url: '',  // 可以后续添加网址字段
                   size: 8,
                   border: 4
               };
               
               console.log('MeCard数据:', cardFields);
               
               const response = await fetch('/api/generate_mecard', {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json',
                   },
                   body: JSON.stringify(cardFields)
               });
               
               const result = await response.json();
               
               if (result.success) {
                   console.log('后端MeCard二维码生成成功');
                   
                   // 保存二维码数据
                   generatedCardQRCode = result.qr_code;
                   
                   // 只更新预览区域，不影响名片上的用户二维码
                   updateCardContentQRPreview(result.qr_code);
                   
                   showNotification('名片二维码生成成功（MeCard格式）！', 'success');
               } else {
                   console.error('后端MeCard二维码生成失败:', result.error);
                   throw new Error(result.message || '后端MeCard生成失败');
               }
            
        } catch (fetchError) {
            console.error('调用后端API失败:', fetchError);
            throw new Error('无法连接到后端服务: ' + fetchError.message);
        }
        
    } catch (error) {
        console.error('=== 二维码生成失败 ===', error);
        alert('二维码生成失败: ' + error.message);
    }
}

// 将名片内容格式化为文本
function formatCardContentAsText(cardContent) {
    // 包含完整名片信息的格式化
    let text = `姓名: ${cardContent.name || '未知'}`;
    
    if (cardContent.title && cardContent.title.trim()) {
        text += `\n职位: ${cardContent.title.trim()}`;
    }
    
    if (cardContent.location && cardContent.location.trim()) {
        text += `\n地点: ${cardContent.location.trim()}`;
    }
    
    if (cardContent.highlights && cardContent.highlights.trim()) {
        const highlights = cardContent.highlights.split('\n').filter(item => item.trim()).slice(0, 3);
        if (highlights.length > 0) {
            text += `\n履历亮点:\n${highlights.map(h => '• ' + h.trim()).join('\n')}`;
        }
    }
    
    if (cardContent.skills && cardContent.skills.trim()) {
        const skills = cardContent.skills.split('\n').filter(item => item.trim()).slice(0, 3);
        if (skills.length > 0) {
            text += `\n擅长技能:\n${skills.map(s => '• ' + s.trim()).join('\n')}`;
        }
    }
    
    if (cardContent.interests && cardContent.interests.trim()) {
        const interests = cardContent.interests.split('\n').filter(item => item.trim()).slice(0, 2);
        if (interests.length > 0) {
            text += `\n兴趣爱好:\n${interests.map(i => '• ' + i.trim()).join('\n')}`;
        }
    }
    
    if (cardContent.motto && cardContent.motto.trim()) {
        text += `\n个人格言: ${cardContent.motto.trim()}`;
    }
    
    return text;
}

// 更新二维码显示
function updateQRCode(qrCodeUrl) {
    const cardQRCode = document.getElementById('cardQRCode');
    const defaultQRCode = document.getElementById('defaultQRCode');
    
    console.log('updateQRCode被调用，qrCodeUrl长度:', qrCodeUrl ? qrCodeUrl.length : 'null');
    console.log('cardQRCode元素:', cardQRCode);
    console.log('defaultQRCode元素:', defaultQRCode);
    
    if (qrCodeUrl) {
        cardQRCode.src = qrCodeUrl;
        cardQRCode.classList.remove('hidden');
        defaultQRCode.classList.add('hidden');
        console.log('已设置cardQRCode.src并显示图片');
        
        // 添加加载事件监听
        cardQRCode.onload = function() {
            console.log('名片二维码图片加载成功');
        };
        cardQRCode.onerror = function() {
            console.error('名片二维码图片加载失败');
        };
    } else {
        cardQRCode.classList.add('hidden');
        defaultQRCode.classList.remove('hidden');
        console.log('隐藏二维码，显示默认图标');
    }
}

// 更新名片内容二维码预览区域
function updateCardContentQRPreview(qrCodeUrl) {
    const cardContentQRCode = document.getElementById('cardContentQRCode');
    const defaultCardQRCode = document.getElementById('defaultCardQRCode');
    
    console.log('updateCardContentQRPreview被调用，qrCodeUrl长度:', qrCodeUrl ? qrCodeUrl.length : 'null');
    console.log('cardContentQRCode元素:', cardContentQRCode);
    console.log('defaultCardQRCode元素:', defaultCardQRCode);
    
    if (qrCodeUrl) {
        cardContentQRCode.src = qrCodeUrl;
        cardContentQRCode.classList.remove('hidden');
        defaultCardQRCode.classList.add('hidden');
        console.log('已设置cardContentQRCode.src并显示预览图片');
        
        // 添加加载事件监听
        cardContentQRCode.onload = function() {
            console.log('名片内容二维码预览图片加载成功');
        };
        cardContentQRCode.onerror = function() {
            console.error('名片内容二维码预览图片加载失败');
        };
    } else {
        cardContentQRCode.classList.add('hidden');
        defaultCardQRCode.classList.remove('hidden');
        console.log('隐藏预览二维码，显示默认提示');
    }
}

// 生成名片二维码（扫描查看名片）（使用Python后端）
async function generateCardShareQRCode() {
    const name = document.getElementById('name').value;
    if (!name.trim()) {
        alert('请先填写姓名信息！');
        return;
    }
    
    try {
        // 将名片数据编码到URL中
        const cardData = encodeCardData();
        const cardUrl = `${window.location.origin}${window.location.pathname}?card=${cardData}`;
        console.log('分享URL:', cardUrl);
        console.log('URL长度:', cardUrl.length);
        
        // 显示加载状态
        showNotification('正在生成分享二维码...', 'info');
        
        // 调用Python后端API生成二维码
        try {
            const response = await fetch('/api/generate_qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: cardUrl,
                    size: 10,
                    border: 4
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('后端分享二维码生成成功');
                
                // 更新名片上的二维码显示
                updateQRCode(result.qr_code);
                // 显示二维码
                showQRCodeModal(result.qr_code, cardUrl);
            } else {
                console.error('后端分享二维码生成失败:', result.error);
                alert('分享二维码生成失败：' + (result.message || '后端生成失败'));
            }
        } catch (fetchError) {
            console.error('调用后端API失败:', fetchError);
            alert('分享二维码生成失败：无法连接到后端服务');
        }
    } catch (generalError) {
        console.error('生成分享二维码时发生未知错误:', generalError);
        alert('生成分享二维码时发生错误：' + generalError.message);
    }
}

// 下载名片二维码（程序生成的包含完整名片内容的二维码）
function downloadCardQRCode() {
    if (!generatedCardQRCode) {
        alert('请先生成名片二维码！');
        return;
    }
    
    const name = document.getElementById('name').value || '名片';
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = generatedCardQRCode;
    link.download = `${name}-名片内容二维码.png`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('名片内容二维码下载成功！', 'success');
}

// 编码名片数据为URL参数（使用简化格式）
function encodeCardData() {
    const name = document.getElementById('name').value || '';
    const location = document.getElementById('location').value || '';
    const title = document.getElementById('title').value || '';
    const avatar = document.getElementById('avatar').value || '';
    const highlights = document.getElementById('highlights').value || '';
    const skills = document.getElementById('skills').value || '';
    const interests = document.getElementById('interests').value || '';
    const motto = document.getElementById('motto').value || '';
    
    // 使用简单的分隔符格式，大大减少数据量
    const data = [name, location, title, avatar, highlights, skills, interests, motto].join('|');
    return btoa(data);
}

// 解码名片数据
function decodeCardData(encodedData) {
    try {
        const data = atob(encodedData).split('|');
        return {
            name: data[0] || '',
            location: data[1] || '',
            title: data[2] || '',
            avatar: data[3] || '',
            highlights: data[4] || '',
            skills: data[5] || '',
            interests: data[6] || '',
            motto: data[7] || ''
        };
    } catch (error) {
        console.error('解码名片数据失败:', error);
        return null;
    }
}

// 下载名片HTML文件
function shareCard() {
    const name = document.getElementById('name').value;
    if (!name.trim()) {
        alert('请先填写姓名信息！');
        return;
    }
    
    // 生成完整的HTML文件内容
    const cardData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        location: document.getElementById('location').value,
        title: document.getElementById('title').value,
        avatar: document.getElementById('avatar').value,
        highlights: document.getElementById('highlights').value,
        skills: document.getElementById('skills').value,
        interests: document.getElementById('interests').value,
        motto: document.getElementById('motto').value
    };
    
    const htmlContent = generateCardHTML(cardData);
    
    // 创建下载链接
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${name}-个人名片.html`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('名片HTML文件下载成功！', 'success');
}

// 生成独立的HTML名片文件
function generateCardHTML(data) {
    const qrCodeImg = document.getElementById('cardQRCode').src || '';
    const avatarImg = data.avatar || '';
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name}的个人名片</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { margin: 0; padding: 20px; background: #f9fafb; }
        .card-container { max-width: 400px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="card-container">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 shadow-lg">
            <!-- 头部信息 -->
            <div class="text-center mb-6">
                <div class="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    ${avatarImg ? `<img src="${avatarImg}" alt="头像" class="w-full h-full object-cover">` : '<i class="fas fa-user text-gray-500 text-2xl"></i>'}
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-1">${data.name}</h3>
                <p class="text-gray-600 mb-2 flex items-center justify-center">
                    <i class="fas fa-phone mr-1"></i>${data.phone || '您的手机号'}
                </p>
                <p class="text-gray-600 mb-2 flex items-center justify-center">
                    <i class="fas fa-envelope mr-1"></i>${data.email || '您的邮箱'}
                </p>
                <p class="text-gray-600 mb-2 flex items-center justify-center">
                    <i class="fas fa-building mr-1"></i>${data.company || '您的公司'}
                </p>
                <p class="text-gray-600 mb-2 flex items-center justify-center">
                    <i class="fas fa-map-marker-alt mr-1"></i>${data.location || '您的地点'}
                </p>
                <span class="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">${data.title || '您的身份标签'}</span>
            </div>

            <!-- 主体部分 -->
            <div class="space-y-4 mb-6">
                <!-- 履历亮点 -->
                <div>
                    <h4 class="flex items-center text-gray-800 font-semibold mb-2">
                        <i class="fas fa-star text-yellow-500 mr-2"></i>履历亮点
                    </h4>
                    <ul class="text-sm text-gray-700 space-y-1">
                        ${data.highlights ? data.highlights.split('\n').filter(item => item.trim()).map(item => `<li>• ${item.trim()}</li>`).join('') : '<li>• 请填写您的履历亮点</li>'}
                    </ul>
                </div>

                <!-- 擅长领域 -->
                <div>
                    <h4 class="flex items-center text-gray-800 font-semibold mb-2">
                        <i class="fas fa-cogs text-green-500 mr-2"></i>擅长领域
                    </h4>
                    <ul class="text-sm text-gray-700 space-y-1">
                        ${data.skills ? data.skills.split('\n').filter(item => item.trim()).map(item => `<li>• ${item.trim()}</li>`).join('') : '<li>• 请填写您的专业技能</li>'}
                    </ul>
                </div>

                <!-- 兴趣爱好 -->
                <div>
                    <h4 class="flex items-center text-gray-800 font-semibold mb-2">
                        <i class="fas fa-heart text-red-500 mr-2"></i>兴趣爱好
                    </h4>
                    <ul class="text-sm text-gray-700 space-y-1">
                        ${data.interests ? data.interests.split('\n').filter(item => item.trim()).map(item => `<li>• ${item.trim()}</li>`).join('') : '<li>• 请填写您的兴趣爱好</li>'}
                    </ul>
                </div>
            </div>

            <!-- 页脚部分 -->
            <div class="border-t border-gray-200 pt-4">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <p class="text-sm text-gray-600 italic">"${data.motto}"</p>
                    </div>
                    <div class="w-12 h-12 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center ml-4 overflow-hidden">
                        ${qrCodeImg ? `<img src="${qrCodeImg}" alt="二维码" class="w-full h-full object-cover">` : '<i class="fas fa-qrcode text-gray-500"></i>'}
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="text-center mt-6 text-gray-500">
        <p>此名片由个人社交名片生成器创建</p>
    </div>
</body>
</html>`;
}

// 显示二维码模态框
function showQRCodeModal(qrCodeDataUrl, cardUrl) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
            <div class="text-center">
                <h3 class="text-lg font-semibold mb-4">名片二维码</h3>
                <img src="${qrCodeDataUrl}" alt="名片二维码" class="mx-auto mb-4 border rounded">
                <p class="text-sm text-gray-600 mb-4">扫描二维码查看名片</p>
                <div class="flex space-x-2">
                    <button onclick="downloadQRCode('${qrCodeDataUrl}')" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                        下载二维码
                    </button>
                    <button onclick="closeModal()" class="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
                        关闭
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    window.closeModal = function() {
        document.body.removeChild(modal);
        delete window.closeModal;
        delete window.downloadQRCode;
    };
    
    window.downloadQRCode = function(dataUrl) {
        const link = document.createElement('a');
        link.download = `${document.getElementById('name').value}-名片二维码.png`;
        link.href = dataUrl;
        link.click();
    };
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 触发名片更新
function triggerCardUpdate() {
    const name = document.getElementById('name').value || '您的姓名';
    const phone = document.getElementById('phone').value || '您的手机号';
    const email = document.getElementById('email').value || '您的邮箱';
    const company = document.getElementById('company').value || '您的公司';
    const location = document.getElementById('location').value || '您的地点';
    const title = document.getElementById('title').value || '您的身份标签';
    const avatar = document.getElementById('avatar').value;
    const highlights = document.getElementById('highlights').value;
    const skills = document.getElementById('skills').value;
    const interests = document.getElementById('interests').value;
    const motto = document.getElementById('motto').value || '您的个人态度';
    
    updateCardContent(name, phone, email, company, location, title, avatar, highlights, skills, interests, motto);
}

// 实时预览功能
function setupRealTimePreview() {
    const inputs = ['name', 'phone', 'email', 'company', 'location', 'title', 'highlights', 'skills', 'interests', 'motto'];
    
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        element.addEventListener('input', function() {
            // 延迟更新，避免频繁操作
            clearTimeout(this.updateTimer);
            this.updateTimer = setTimeout(() => {
                triggerCardUpdate();
                checkDataLength(); // 实时检查数据长度
            }, 300);
        });
    });
}

// 实时检查数据长度并提供反馈
function checkDataLength() {
    const cardContent = {
        name: document.getElementById('name').value,
        location: document.getElementById('location').value,
        title: document.getElementById('title').value,
        highlights: document.getElementById('highlights').value,
        skills: document.getElementById('skills').value,
        interests: document.getElementById('interests').value,
        motto: document.getElementById('motto').value
    };
    
    const cardText = formatCardContentAsText(cardContent);
    const lengthIndicator = document.getElementById('length-indicator');
    
    if (lengthIndicator) {
        const length = cardText.length;
        lengthIndicator.textContent = `数据长度: ${length} 字符 (无限制)`;
        lengthIndicator.style.color = '#00aa00';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    setupRealTimePreview();
    handleAvatarUpload();
    handleQRCodeUpload();
    
    // 初始化数据长度检查
    checkDataLength();
    
    // 检查URL参数是否包含名片数据
    const urlParams = new URLSearchParams(window.location.search);
    const cardData = urlParams.get('card');
    
    if (cardData) {
        const decodedData = decodeCardData(cardData);
        if (decodedData) {
            // 填充表单数据
            Object.keys(decodedData).forEach(key => {
                const element = document.getElementById(key);
                if (element && decodedData[key]) {
                    element.value = decodedData[key];
                }
            });
            // 生成名片
            generateCard();
            // 隐藏表单区域
            const formArea = document.getElementById('formArea');
            if (formArea) formArea.style.display = 'none';
            // 只保留 businessCard，隐藏 previewArea 其它内容
            const previewArea = document.getElementById('previewArea');
            if (previewArea) {
                // 克隆 businessCard 节点用于截图
                const businessCard = document.getElementById('businessCard');
                const cardClone = businessCard.cloneNode(true);
                // 让克隆节点脱离原布局，避免样式干扰
                cardClone.style.position = 'absolute';
                cardClone.style.left = '-9999px';
                cardClone.style.top = '0';
                cardClone.style.zIndex = '-1';
                document.body.appendChild(cardClone);
                // 等待头像图片加载完成后截图
                const avatarImg = cardClone.querySelector('#cardAvatar');
                function doScreenshot() {
                    html2canvas(cardClone, {
                        backgroundColor: '#ffffff',
                        scale: 2,
                        useCORS: true,
                        allowTaint: true
                    }).then(canvas => {
                        document.body.removeChild(cardClone);
                        previewArea.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = canvas.toDataURL('image/png');
                        img.alt = '名片图片';
                        img.className = 'mx-auto rounded-xl shadow-lg';
                        previewArea.appendChild(img);
                        // 添加保存按钮
                        const saveBtn = document.createElement('button');
                        saveBtn.textContent = '保存名片图片';
                        saveBtn.className = 'mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium';
                        saveBtn.onclick = function() {
                            const link = document.createElement('a');
                            link.href = img.src;
                            link.download = (decodedData.name || '名片') + '-图片.png';
                            link.click();
                        };
                        previewArea.appendChild(saveBtn);
                    });
                }
                if (avatarImg && !avatarImg.classList.contains('hidden')) {
                    avatarImg.onload = doScreenshot;
                    if (avatarImg.complete) {
                        doScreenshot();
                    }
                } else {
                    doScreenshot();
                }
            }
            showNotification('已加载分享的名片数据', 'success');
        }
    }
    
    // 添加一些示例数据
    const examples = {
        name: '张三',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        company: '北京科技有限公司',
        location: '北京市',
        title: '产品经理',
        highlights: '5年互联网产品经验\n主导过3个千万级用户产品\n获得公司年度最佳员工奖',
        skills: 'Python编程\n数据分析\n产品设计\nUI/UX设计',
        interests: '摄影\n旅行\n阅读\n健身',
        motto: '用心做产品，用爱做人生'
    };
    
    // 添加示例按钮
    const exampleBtn = document.createElement('button');
    exampleBtn.textContent = '填入示例数据';
    exampleBtn.className = 'w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200 font-medium mt-4';
    exampleBtn.onclick = function() {
        Object.keys(examples).forEach(key => {
            document.getElementById(key).value = examples[key];
        });
        generateCard();
    };
    
    // 将示例按钮添加到生成按钮后面
    const generateBtn = document.querySelector('button[onclick="generateCard()"]');
    generateBtn.parentNode.insertBefore(exampleBtn, generateBtn.nextSibling);
});

// 添加键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter 生成名片
    if (e.ctrlKey && e.key === 'Enter') {
        generateCard();
    }
    
    // Ctrl + S 下载名片
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        downloadCardAsPNG();
    }
    
    // Ctrl + Q 生成名片二维码
    if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        generateCardQRCode();
    }
});