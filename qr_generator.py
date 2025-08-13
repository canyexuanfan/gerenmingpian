#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
二维码生成后端服务
使用segno库生成支持中文的二维码
支持MeCard格式以提高微信扫描兼容性
"""

import segno
from segno import helpers
import base64
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # 允许跨域请求

@app.route('/generate_qr', methods=['POST'])
def generate_qr():
    """
    生成二维码API
    接收JSON数据，返回base64编码的二维码图片
    """
    try:
        # 获取请求数据
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': '缺少text参数'}), 400
        
        text = data['text']
        size = data.get('size', 10)  # 默认大小
        border = data.get('border', 4)  # 默认边框
        
        # 使用segno生成二维码
        qr = segno.make_qr(text)
        
        # 将二维码保存到内存中的字节流
        img_buffer = io.BytesIO()
        qr.save(img_buffer, kind='png', scale=size, border=border)
        img_buffer.seek(0)
        
        # 转换为base64编码
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        data_url = f'data:image/png;base64,{img_base64}'
        
        return jsonify({
            'success': True,
            'qr_code': data_url,
            'message': '二维码生成成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '二维码生成失败'
        }), 500

@app.route('/generate_mecard', methods=['POST'])
def generate_mecard():
    """
    生成MeCard格式的名片二维码API
    专门用于名片信息，提高微信扫描兼容性
    """
    try:
        # 获取请求数据
        data = request.get_json()
        print(f"收到MeCard请求数据: {data}")
        
        if not data:
            return jsonify({'error': '缺少请求数据'}), 400
        
        # 提取名片信息
        name = data.get('name', '')
        phone = data.get('phone', '')
        email = data.get('email', '')
        org = data.get('org', '')
        title = data.get('title', '')
        url = data.get('url', '')
        
        print(f"提取的名片信息: name={name}, phone={phone}, email={email}, org={org}, title={title}, url={url}")
        
        size = data.get('size', 10)  # 默认大小
        border = data.get('border', 4)  # 默认边框
        
        # 使用segno.helpers.make_mecard生成MeCard格式二维码
        print("开始生成MeCard二维码...")
        
        # 构建memo字段，包含公司和职位信息
        memo_parts = []
        if org:
            memo_parts.append(f"公司: {org}")
        if title:
            memo_parts.append(f"职位: {title}")
        memo = "\n".join(memo_parts) if memo_parts else None
        
        print(f"生成的memo信息: {memo}")
        
        # 构建符合MeCard标准的字符串，正确使用ORG字段存储公司信息
        mecard_parts = ["MECARD:"]
        
        if name:
            mecard_parts.append(f"N:{name};")
        if phone:
            mecard_parts.append(f"TEL:{phone};")
        if email:
            mecard_parts.append(f"EMAIL:{email};")
        if org:
            mecard_parts.append(f"ORG:{org};")
        if url:
            mecard_parts.append(f"URL:{url};")
        
        # 如果有职位信息，使用NOTE字段存储
        if title:
            mecard_parts.append(f"NOTE:职位: {title};")
        
        # 结束标记
        mecard_parts.append(";")
        
        mecard_data = "".join(mecard_parts)
        print(f"生成的标准MeCard数据: {mecard_data}")
        
        # 使用segno直接创建二维码
        qr = segno.make(mecard_data)
        print("MeCard二维码生成成功")
        
        # 将二维码保存到内存中的字节流
        img_buffer = io.BytesIO()
        qr.save(img_buffer, kind='png', scale=size, border=border)
        img_buffer.seek(0)
        
        # 转换为base64编码
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
        data_url = f'data:image/png;base64,{img_base64}'
        
        return jsonify({
            'success': True,
            'qr_code': data_url,
            'message': 'MeCard二维码生成成功',
            'format': 'MeCard'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'MeCard二维码生成失败'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({'status': 'ok', 'message': '二维码服务运行正常'})

if __name__ == '__main__':
    print("启动二维码生成服务...")
    print("访问 http://localhost:5000/health 检查服务状态")
    print("使用 POST http://localhost:5000/generate_qr 生成二维码")
    app.run(host='0.0.0.0', port=5000, debug=True)