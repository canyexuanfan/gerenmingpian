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
            
            if not data or 'text' not in data:
                response = {
                    'success': False,
                    'error': '缺少text参数',
                    'message': '请提供要生成二维码的文本内容'
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            
            text = data['text']
            size = data.get('size', 10)
            border = data.get('border', 4)
            
            if segno:
                # 使用segno生成二维码
                qr = segno.make_qr(text)
                
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
                    'message': '二维码生成成功'
                }
            else:
                # 备用方案：返回错误信息
                response = {
                    'success': False,
                    'error': 'segno库不可用',
                    'message': '二维码生成服务暂时不可用，请稍后重试'
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
                'message': '二维码生成失败'
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