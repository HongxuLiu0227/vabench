#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tableau .twbx 文件解析工具
解析 .twbx 文件，提取 .twb 文件，并将 Data 文件夹中的数据文件转换为 CSV 格式
支持的数据格式: .hyper, .xls, .xlsx, .tde, .csv

文件结构:
  parse/
    ├── parse_twbx.py
    ├── input_twbx/      (存放要处理的 .twbx 文件)
    └── output_twbx/     (输出目录)
        └── {twbx文件名}/
            ├── {twb文件}.twb
            └── data/
                └── {csv文件}.csv
"""

import zipfile
import os
import sys
import shutil
import tempfile
import glob
from pathlib import Path

# 获取脚本所在目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(SCRIPT_DIR, "..", "dashboard")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "output", "dashboard", "output_twbx")

# 尝试导入所需的库
try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False
    print("警告: 未安装 pandas，无法处理 Excel 文件")

try:
    from tableauhyperapi import HyperProcess, Telemetry, Connection, CreateMode, TableDefinition, SqlType, TableName
    HAS_HYPERAPI = True
except ImportError:
    HAS_HYPERAPI = False
    print("警告: 未安装 tableauhyperapi，无法处理 .hyper 文件")

try:
    from pytde import read_tde
    HAS_PYTDE = True
except ImportError:
    HAS_PYTDE = False
    print("警告: 未安装 pytde，无法处理 .tde 文件")


def convert_hyper_to_csv(hyper_file_path, output_csv_path):
    """
    将 .hyper 文件转换为 CSV 格式
    
    参数:
        hyper_file_path: .hyper 文件路径
        output_csv_path: 输出 CSV 文件路径（如果多个表，会创建多个文件）
    """
    if not HAS_HYPERAPI:
        raise ImportError("需要安装 tableauhyperapi 库来处理 .hyper 文件")
    
    if not HAS_PANDAS:
        raise ImportError("需要安装 pandas 库来处理数据")
    
    try:
        converted_files = []
        with HyperProcess(telemetry=Telemetry.SEND_USAGE_DATA_TO_TABLEAU) as hyper:
            with Connection(endpoint=hyper.endpoint, database=hyper_file_path, create_mode=CreateMode.NONE) as connection:
                # 获取所有 schema 和表
                catalog = connection.catalog
                schemas = catalog.get_schema_names()
                
                all_table_names = []
                for schema in schemas:
                    tables = catalog.get_table_names(schema=schema)
                    all_table_names.extend(tables)
                
                if not all_table_names:
                    print(f"  警告: {hyper_file_path} 中没有找到表")
                    return False
                
                # 处理每个表
                base_name = Path(output_csv_path).stem
                base_dir = Path(output_csv_path).parent
                
                for table_name_obj in all_table_names:
                    try:
                        # table_name_obj 是 TableName 对象
                        schema_name = str(table_name_obj.schema_name)
                        table_name = str(table_name_obj.name)
                        
                        # 使用 TableName 对象直接构建查询
                        sql_query = f'SELECT * FROM {table_name_obj}'
                        
                        # 执行查询获取所有数据
                        with connection.execute_query(sql_query) as result:
                            # 获取列名
                            columns = [col.name for col in result.schema.columns]
                            
                            # 读取所有行数据
                            data = []
                            for row in result:
                                data.append(list(row))
                            
                            if not data:
                                print(f"  警告: 表 {schema_name}.{table_name} 没有数据")
                                continue
                            
                            # 创建 DataFrame
                            df = pd.DataFrame(data, columns=columns)
                        
                        # 生成输出文件名
                        if len(all_table_names) == 1:
                            # 只有一个表，使用原始输出路径
                            table_csv_path = output_csv_path
                        else:
                            # 多个表，为每个表创建单独的文件
                            safe_schema = schema_name.replace('"', '').replace(' ', '_').replace('/', '_')
                            safe_table = table_name.replace('"', '').replace(' ', '_').replace('/', '_')
                            table_csv_path = base_dir / f"{base_name}_{safe_schema}_{safe_table}.csv"
                        
                        # 保存为 CSV
                        df.to_csv(table_csv_path, index=False, encoding='utf-8-sig')
                        converted_files.append(str(table_csv_path))
                        print(f"  成功转换: {schema_name}.{table_name} -> {table_csv_path} ({len(df)} 行)")
                    
                    except Exception as e:
                        print(f"  错误: 转换表 {schema_name}.{table_name} 失败 - {str(e)}")
                        import traceback
                        traceback.print_exc()
                        continue
        
        return len(converted_files) > 0
    except Exception as e:
        print(f"  错误: 转换 .hyper 文件失败 - {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def convert_excel_to_csv(excel_file_path, output_csv_path):
    """
    将 Excel 文件 (.xls, .xlsx) 转换为 CSV 格式
    
    参数:
        excel_file_path: Excel 文件路径
        output_csv_path: 输出 CSV 文件路径（如果多个工作表，会创建多个文件）
    """
    if not HAS_PANDAS:
        raise ImportError("需要安装 pandas 库来处理 Excel 文件")
    
    try:
        # 读取 Excel 文件的所有工作表
        excel_file = pd.ExcelFile(excel_file_path)
        sheet_names = excel_file.sheet_names
        
        base_name = Path(output_csv_path).stem
        base_dir = Path(output_csv_path).parent
        
        converted_count = 0
        
        for sheet_name in sheet_names:
            try:
                # 读取每个工作表
                df = excel_file.parse(sheet_name)
                
                # 生成输出文件名
                if len(sheet_names) == 1:
                    # 只有一个工作表，使用原始输出路径
                    sheet_csv_path = output_csv_path
                else:
                    # 多个工作表，为每个工作表创建单独的文件
                    safe_sheet_name = sheet_name.replace(' ', '_').replace('/', '_')
                    sheet_csv_path = base_dir / f"{base_name}_{safe_sheet_name}.csv"
                
                # 保存为 CSV
                df.to_csv(sheet_csv_path, index=False, encoding='utf-8-sig')
                converted_count += 1
                print(f"  成功转换工作表: {sheet_name} -> {sheet_csv_path} ({len(df)} 行)")
            
            except Exception as e:
                print(f"  错误: 转换工作表 {sheet_name} 失败 - {str(e)}")
                continue
        
        return converted_count > 0
    except Exception as e:
        print(f"  错误: 转换 Excel 文件失败 - {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def convert_tde_to_csv(tde_file_path, output_csv_path):
    """
    将 .tde 文件转换为 CSV 格式
    
    参数:
        tde_file_path: .tde 文件路径
        output_csv_path: 输出 CSV 文件路径
    """
    if not HAS_PYTDE:
        raise ImportError("需要安装 pytde 库来处理 .tde 文件")
    
    if not HAS_PANDAS:
        raise ImportError("需要安装 pandas 库来处理数据")
    
    try:
        # 使用 pytde 读取 .tde 文件，直接返回 DataFrame
        print(f"  正在读取 .tde 文件...")
        df = read_tde(tde_file_path)
        
        if df is None or df.empty:
            print(f"  警告: {tde_file_path} 中没有数据")
            return False
        
        # 保存为 CSV
        df.to_csv(output_csv_path, index=False, encoding='utf-8-sig')
        print(f"  成功转换: {tde_file_path} -> {output_csv_path} ({len(df)} 行, {len(df.columns)} 列)")
        return True
    
    except Exception as e:
        print(f"  错误: 转换 .tde 文件失败 - {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def convert_csv_file(csv_file_path, output_csv_path):
    """
    处理已有的 CSV 文件（复制到输出目录）
    
    参数:
        csv_file_path: 源 CSV 文件路径
        output_csv_path: 输出 CSV 文件路径
    """
    try:
        shutil.copy2(csv_file_path, output_csv_path)
        print(f"  已复制 CSV 文件: {csv_file_path} -> {output_csv_path}")
        return True
    except Exception as e:
        print(f"  错误: 复制 CSV 文件失败 - {str(e)}")
        return False


def convert_data_file_to_csv(data_file_path, output_dir):
    """
    根据文件扩展名，将数据文件转换为 CSV
    
    参数:
        data_file_path: 数据文件路径
        output_dir: 输出目录
    
    返回:
        转换后的 CSV 文件路径列表
    """
    file_path = Path(data_file_path)
    file_ext = file_path.suffix.lower()
    file_name = file_path.stem
    
    # 创建输出目录
    os.makedirs(output_dir, exist_ok=True)
    
    output_csv_path = os.path.join(output_dir, f"{file_name}.csv")
    converted_files = []
    
    print(f"\n处理文件: {data_file_path}")
    print(f"  格式: {file_ext}")
    
    try:
        if file_ext == '.hyper':
            # .hyper 文件可能返回多个 CSV 文件
            success = convert_hyper_to_csv(data_file_path, output_csv_path)
            if success:
                # 查找生成的 CSV 文件
                base_name = file_name
                for csv_file in Path(output_dir).glob(f"{base_name}*.csv"):
                    converted_files.append(str(csv_file))
        
        elif file_ext in ['.xls', '.xlsx']:
            # Excel 文件可能返回多个 CSV 文件（多个工作表）
            success = convert_excel_to_csv(data_file_path, output_csv_path)
            if success:
                # 查找生成的 CSV 文件
                base_name = file_name
                for csv_file in Path(output_dir).glob(f"{base_name}*.csv"):
                    converted_files.append(str(csv_file))
        
        elif file_ext == '.tde':
            # .tde 文件转换
            success = convert_tde_to_csv(data_file_path, output_csv_path)
            if success:
                converted_files.append(output_csv_path)
        
        elif file_ext == '.csv':
            if convert_csv_file(data_file_path, output_csv_path):
                converted_files.append(output_csv_path)
        
        else:
            print(f"  警告: 不支持的文件格式: {file_ext}")
            print(f"  跳过文件: {data_file_path}")
    
    except Exception as e:
        print(f"  错误: 处理文件时出错 - {str(e)}")
        import traceback
        traceback.print_exc()
    
    return converted_files


def parse_twbx(twbx_file_path, output_base_dir):
    """
    解析 .twbx 文件，提取 .twb 文件，并将 Data 文件夹中的数据文件转换为 CSV
    
    参数:
        twbx_file_path: .twbx 文件的路径
        output_base_dir: 输出基础目录（output_twbx）
    
    返回:
        dict: 包含提取的文件信息的字典
    """
    # 检查文件是否存在
    if not os.path.exists(twbx_file_path):
        raise FileNotFoundError(f"文件不存在: {twbx_file_path}")
    
    # 检查文件扩展名
    if not twbx_file_path.lower().endswith('.twbx'):
        raise ValueError(f"文件不是 .twbx 格式: {twbx_file_path}")
    
    # 获取 .twbx 文件名（不含扩展名）
    twbx_name = Path(twbx_file_path).stem
    
    # 创建输出目录结构: output_twbx/{twbx文件名}/
    output_dir = os.path.join(output_base_dir, twbx_name)
    os.makedirs(output_dir, exist_ok=True)
    
    # CSV 输出目录: output_twbx/{twbx文件名}/data/
    csv_output_dir = os.path.join(output_dir, "data")
    os.makedirs(csv_output_dir, exist_ok=True)
    
    result = {
        'twb_files': [],
        'data_files': [],
        'converted_csv_files': []
    }
    
    # 使用临时目录来提取文件，避免文件被占用的问题
    temp_extract_dir = None
    
    try:
        # 打开 .twbx 文件（它实际上是一个 ZIP 文件）
        with zipfile.ZipFile(twbx_file_path, 'r') as zip_ref:
            # 获取 ZIP 文件中的所有文件列表
            file_list = zip_ref.namelist()
            print(f"发现 {len(file_list)} 个文件在 .twbx 中:")
            for file_name in file_list:
                print(f"  - {file_name}")
            
            # 创建临时目录用于提取
            temp_extract_dir = tempfile.mkdtemp(prefix='twbx_extract_')
            print(f"使用临时目录提取: {temp_extract_dir}")
            
            # 提取所有文件到临时目录
            zip_ref.extractall(temp_extract_dir)
            
            # 查找 .twb 文件并复制到输出目录
            for file_name in file_list:
                temp_path = os.path.join(temp_extract_dir, file_name)
                if os.path.isfile(temp_path):
                    if file_name.lower().endswith('.twb'):
                        # 复制 .twb 文件到输出目录
                        output_twb_path = os.path.join(output_dir, os.path.basename(file_name))
                        shutil.copy2(temp_path, output_twb_path)
                        result['twb_files'].append(output_twb_path)
            
            # 查找 Data 文件夹中的数据文件
            data_folder = os.path.join(temp_extract_dir, "Data")
            if os.path.exists(data_folder):
                print(f"\n查找 Data 文件夹中的数据文件...")
                for root, dirs, files in os.walk(data_folder):
                    for file in files:
                        file_path = os.path.join(root, file)
                        file_ext = Path(file).suffix.lower()
                        
                        # 支持的数据文件格式
                        if file_ext in ['.hyper', '.xls', '.xlsx', '.tde', '.csv']:
                            result['data_files'].append(file_path)
            
            # 打印提取结果
            print(f"\n提取结果:")
            if result['twb_files']:
                print(f"\n找到 {len(result['twb_files'])} 个 .twb 文件:")
                for twb_file in result['twb_files']:
                    file_size = os.path.getsize(twb_file)
                    print(f"  - {twb_file} ({file_size:,} 字节)")
            
            if result['data_files']:
                print(f"\n找到 {len(result['data_files'])} 个数据文件:")
                for data_file in result['data_files']:
                    file_size = os.path.getsize(data_file)
                    print(f"  - {data_file} ({file_size:,} 字节)")
            
            # 转换数据文件为 CSV
            if result['data_files']:
                print(f"\n开始转换数据文件为 CSV 格式...")
                print(f"CSV 输出目录: {csv_output_dir}")
                print("-" * 50)
                
                for data_file in result['data_files']:
                    converted = convert_data_file_to_csv(data_file, csv_output_dir)
                    result['converted_csv_files'].extend(converted)
                
                print("-" * 50)
                if result['converted_csv_files']:
                    print(f"\n成功转换 {len(result['converted_csv_files'])} 个 CSV 文件:")
                    for csv_file in result['converted_csv_files']:
                        file_size = os.path.getsize(csv_file)
                        print(f"  - {csv_file} ({file_size:,} 字节)")
                else:
                    print("\n警告: 没有成功转换任何文件")
    
    except zipfile.BadZipFile:
        raise ValueError(f"文件不是有效的 ZIP 格式: {twbx_file_path}")
    except Exception as e:
        raise Exception(f"解析文件时出错: {str(e)}")
    finally:
        # 清理临时目录
        if temp_extract_dir and os.path.exists(temp_extract_dir):
            try:
                shutil.rmtree(temp_extract_dir)
                print(f"\n已清理临时目录: {temp_extract_dir}")
            except Exception as e:
                print(f"警告: 清理临时目录失败 - {str(e)}")
    
    return result


def main():
    """主函数"""
    # 设置 Windows 控制台编码为 UTF-8（如果可能）
    if sys.platform == 'win32':
        try:
            import io
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
        except:
            pass
    
    # 确保输入和输出目录存在
    os.makedirs(INPUT_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 解析命令行参数
    if len(sys.argv) > 1:
        # 如果提供了文件路径，处理单个文件
        twbx_file = sys.argv[1]
        if not os.path.isabs(twbx_file):
            # 相对路径，尝试在 input_twbx 文件夹中查找
            input_path = os.path.join(INPUT_DIR, twbx_file)
            if os.path.exists(input_path):
                twbx_file = input_path
            elif not os.path.exists(twbx_file):
                # 如果都不存在，尝试直接使用
                pass
        
        if not os.path.exists(twbx_file):
            print(f"错误: 文件不存在: {twbx_file}")
            print(f"提示: 请将 .twbx 文件放在 {INPUT_DIR} 文件夹中")
            sys.exit(1)
        
        print(f"正在解析: {twbx_file}")
        print(f"输出目录: {OUTPUT_DIR}")
        print("-" * 50)
        
        try:
            result = parse_twbx(twbx_file, OUTPUT_DIR)
            
            print("-" * 50)
            print(f"\n解析完成!")
            print(f"  - 提取了 {len(result['twb_files'])} 个 .twb 文件")
            print(f"  - 找到了 {len(result['data_files'])} 个数据文件")
            print(f"  - 转换了 {len(result['converted_csv_files'])} 个 CSV 文件")
            print(f"\n输出位置: {OUTPUT_DIR}")
        
        except Exception as e:
            print(f"错误: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            sys.exit(1)
    else:
        # 如果没有提供参数，处理 input_twbx 文件夹中的所有 .twbx 文件
        print(f"扫描输入目录: {INPUT_DIR}")
        twbx_files = glob.glob(os.path.join(INPUT_DIR, "*.twbx"))
        
        if not twbx_files:
            print(f"未找到 .twbx 文件")
            print(f"请将 .twbx 文件放在 {INPUT_DIR} 文件夹中")
            print(f"\n或者使用: python parse_twbx.py <twbx文件路径>")
            sys.exit(1)
        
        print(f"找到 {len(twbx_files)} 个 .twbx 文件")
        print(f"输出目录: {OUTPUT_DIR}")
        print("=" * 50)
        
        for i, twbx_file in enumerate(twbx_files, 1):
            print(f"\n[{i}/{len(twbx_files)}] 处理: {os.path.basename(twbx_file)}")
            print("-" * 50)
            
            try:
                result = parse_twbx(twbx_file, OUTPUT_DIR)
                
                print(f"✓ 完成: 提取了 {len(result['twb_files'])} 个 .twb 文件, "
                      f"转换了 {len(result['converted_csv_files'])} 个 CSV 文件")
            
            except Exception as e:
                print(f"✗ 错误: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        print("\n" + "=" * 50)
        print(f"所有文件处理完成!")
        print(f"输出位置: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()

