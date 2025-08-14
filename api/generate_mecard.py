from http.server import BaseHTTPRequestHandler
import json
import base64
import io
try:
    import segno
except ImportError:
    # 如果segno不可用，使用备用方案
    segno = None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 设置CORS头
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # 读取请求数据
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # 提取MeCard字段
            name = data.get('name', '')
            phone = data.get('phone', '')
            email = data.get('email', '')
            org = data.get('org', '')
            title = data.get('title', '')
            url = data.get('url', '')
            size = data.get('size', 8)
            border = data.get('border', 4)
            
            if not name:
                response = {
                    'success': False,
                    'error': '缺少姓名信息',
                    'message': '请提供姓名信息'
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            
            # 手动构建MeCard格式字符串（支持完整字段）
            mecard_parts = [f'MECARD:N:{name}']
            
            if org:
                mecard_parts.append(f'ORG:{org}')
            if title:
                mecard_parts.append(f'TITLE:{title}')
            if email:
                mecard_parts.append(f'EMAIL:{email}')
            if phone:
                mecard_parts.append(f'TEL:{phone}')
            if url:
                mecard_parts.append(f'URL:{url}')
            
            # 添加结束标记
            mecard_parts.append(';')
            
            # 组合完整的MeCard字符串
            mecard_text = ';'.join(mecard_parts)
            
            if segno:
                # 使用segno生成二维码
                qr = segno.make_qr(mecard_text)
                
                # 将二维码保存到内存中的字节流
                img_buffer = io.BytesIO()
                qr.save(img_buffer, kind='png', scale=size, border=border)
                img_buffer.seek(0)
                
                # 转换为base64编码
                img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
                data_url = f'data:image/png;base64,{img_base64}'
                
                response = {
                    'success': True,
                    'qr_code': data_url,
                    'mecard_data': mecard_text,
                    'message': 'MeCard二维码生成成功'
                }
            else:
                # 备用方案：返回错误信息
                response = {
                    'success': False,
                    'error': 'segno库不可用',
                    'message': 'MeCard二维码生成服务暂时不可用，请稍后重试'
                }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            # 错误处理
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'success': False,
                'error': str(e),
                'message': 'MeCard二维码生成失败'
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(b'')