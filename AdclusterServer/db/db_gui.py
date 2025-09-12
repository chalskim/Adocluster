import os
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import json
import pandas as pd
from pandastable import Table
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

# .env 파일에서 환경 변수 로드
load_dotenv()

# 데이터베이스 설정
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "nicchals")
DB_PASSWORD = os.getenv("DB_PASSWORD", "a770405z")
DB_NAME = os.getenv("DB_NAME", "adcluster_db")


class PostgreSQLGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        
        self.title("PostgreSQL 쿼리 실행기")
        self.geometry("1200x800")
        self.configure(bg="#f0f0f0")
        
        self.connection = None
        self.current_results = None
        
        self.create_widgets()
        self.create_menu()
        
    def create_menu(self):
        menubar = tk.Menu(self)
        
        # 파일 메뉴
        file_menu = tk.Menu(menubar, tearoff=0)
        file_menu.add_command(label="쿼리 불러오기", command=self.load_query)
        file_menu.add_command(label="쿼리 저장하기", command=self.save_query)
        file_menu.add_separator()
        file_menu.add_command(label="결과 저장하기 (CSV)", command=lambda: self.save_results("csv"))
        file_menu.add_command(label="결과 저장하기 (JSON)", command=lambda: self.save_results("json"))
        file_menu.add_separator()
        file_menu.add_command(label="종료", command=self.quit)
        menubar.add_cascade(label="파일", menu=file_menu)
        
        # 데이터베이스 메뉴
        db_menu = tk.Menu(menubar, tearoff=0)
        db_menu.add_command(label="연결", command=self.connect_to_db)
        db_menu.add_command(label="연결 해제", command=self.disconnect_db)
        db_menu.add_separator()
        db_menu.add_command(label="테이블 목록 보기", command=self.show_tables)
        menubar.add_cascade(label="데이터베이스", menu=db_menu)
        
        # 차트 메뉴
        chart_menu = tk.Menu(menubar, tearoff=0)
        chart_menu.add_command(label="막대 차트", command=lambda: self.create_chart("bar"))
        chart_menu.add_command(label="선 차트", command=lambda: self.create_chart("line"))
        chart_menu.add_command(label="파이 차트", command=lambda: self.create_chart("pie"))
        menubar.add_cascade(label="차트", menu=chart_menu)
        
        # 도움말 메뉴
        help_menu = tk.Menu(menubar, tearoff=0)
        help_menu.add_command(label="사용법", command=self.show_help)
        help_menu.add_command(label="정보", command=self.show_about)
        menubar.add_cascade(label="도움말", menu=help_menu)
        
        self.config(menu=menubar)
    
    def create_widgets(self):
        # 프레임 생성
        top_frame = tk.Frame(self, bg="#f0f0f0")
        top_frame.pack(fill=tk.X, padx=10, pady=5)
        
        # 연결 정보 표시 레이블
        self.connection_label = tk.Label(top_frame, text="연결 상태: 연결되지 않음", bg="#f0f0f0", fg="red")
        self.connection_label.pack(side=tk.LEFT, padx=5)
        
        # 연결 버튼
        self.connect_button = tk.Button(top_frame, text="DB 연결", command=self.connect_to_db, bg="#4CAF50", fg="white")
        self.connect_button.pack(side=tk.RIGHT, padx=5)
        
        # 쿼리 입력 영역
        query_frame = tk.LabelFrame(self, text="SQL 쿼리", bg="#f0f0f0")
        query_frame.pack(fill=tk.BOTH, expand=False, padx=10, pady=5)
        
        self.query_text = scrolledtext.ScrolledText(query_frame, height=10, wrap=tk.WORD, font=("Consolas", 11))
        self.query_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 버튼 프레임
        button_frame = tk.Frame(self, bg="#f0f0f0")
        button_frame.pack(fill=tk.X, padx=10, pady=5)
        
        self.execute_button = tk.Button(button_frame, text="쿼리 실행", command=self.execute_query, bg="#2196F3", fg="white", width=15)
        self.execute_button.pack(side=tk.LEFT, padx=5)
        
        self.clear_button = tk.Button(button_frame, text="쿼리 지우기", command=self.clear_query, bg="#f44336", fg="white", width=15)
        self.clear_button.pack(side=tk.LEFT, padx=5)
        
        # 결과 탭
        self.tab_control = ttk.Notebook(self)
        self.tab_control.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        # 결과 탭
        self.result_tab = ttk.Frame(self.tab_control)
        self.tab_control.add(self.result_tab, text="결과")
        
        # 테이블 탭
        self.table_tab = ttk.Frame(self.tab_control)
        self.tab_control.add(self.table_tab, text="테이블 뷰")
        
        # 차트 탭
        self.chart_tab = ttk.Frame(self.tab_control)
        self.tab_control.add(self.chart_tab, text="차트")
        
        # 결과 텍스트 영역
        self.result_text = scrolledtext.ScrolledText(self.result_tab, wrap=tk.WORD, font=("Consolas", 11))
        self.result_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 상태 표시줄
        self.status_bar = tk.Label(self, text="준비됨", bd=1, relief=tk.SUNKEN, anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def connect_to_db(self):
        try:
            self.connection = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                dbname=DB_NAME
            )
            self.connection_label.config(text=f"연결 상태: {DB_NAME}에 연결됨", fg="green")
            self.status_bar.config(text=f"데이터베이스 '{DB_NAME}'에 성공적으로 연결되었습니다.")
            messagebox.showinfo("연결 성공", f"데이터베이스 '{DB_NAME}'에 성공적으로 연결되었습니다.")
        except Exception as e:
            self.connection_label.config(text="연결 상태: 연결 실패", fg="red")
            self.status_bar.config(text=f"데이터베이스 연결 오류: {e}")
            messagebox.showerror("연결 오류", f"데이터베이스 연결 오류: {e}")
    
    def disconnect_db(self):
        if self.connection:
            self.connection.close()
            self.connection = None
            self.connection_label.config(text="연결 상태: 연결되지 않음", fg="red")
            self.status_bar.config(text="데이터베이스 연결이 해제되었습니다.")
            messagebox.showinfo("연결 해제", "데이터베이스 연결이 해제되었습니다.")
    
    def execute_query(self):
        if not self.connection:
            messagebox.showwarning("연결 필요", "먼저 데이터베이스에 연결해주세요.")
            return
        
        query = self.query_text.get("1.0", tk.END).strip()
        if not query:
            messagebox.showwarning("쿼리 필요", "실행할 SQL 쿼리를 입력해주세요.")
            return
        
        try:
            # 쿼리 실행 시작 상태 업데이트
            self.status_bar.config(text="쿼리 실행 중...")
            self.update_idletasks()
            
            # SELECT 쿼리인지 확인
            is_select = query.strip().lower().startswith("select")
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query)
                
                if is_select:
                    results = cursor.fetchall()
                    self.current_results = results
                    self.display_results(results)
                    self.create_table_view(results)
                    self.status_bar.config(text=f"{len(results)}개의 결과가 반환되었습니다.")
                else:
                    self.connection.commit()
                    self.result_text.delete("1.0", tk.END)
                    self.result_text.insert(tk.END, f"{cursor.rowcount}개의 행이 영향을 받았습니다.")
                    self.status_bar.config(text=f"{cursor.rowcount}개의 행이 영향을 받았습니다.")
                    self.current_results = None
                    
                    # 테이블 뷰 초기화
                    for widget in self.table_tab.winfo_children():
                        widget.destroy()
                    
                    # 차트 뷰 초기화
                    for widget in self.chart_tab.winfo_children():
                        widget.destroy()
        except Exception as e:
            self.result_text.delete("1.0", tk.END)
            self.result_text.insert(tk.END, f"쿼리 실행 오류: {e}")
            self.status_bar.config(text=f"쿼리 실행 오류: {e}")
            messagebox.showerror("쿼리 오류", f"쿼리 실행 중 오류가 발생했습니다: {e}")
    
    def display_results(self, results):
        self.result_text.delete("1.0", tk.END)
        
        if not results or len(results) == 0:
            self.result_text.insert(tk.END, "결과가 없습니다.")
            return
        
        # 첫 번째 결과의 키를 컬럼으로 사용
        columns = list(results[0].keys())
        
        # 컬럼 너비 계산
        col_width = {}
        for col in columns:
            col_width[col] = max(len(str(col)), max([len(str(row[col] if row[col] is not None else 'NULL')) for row in results]))
        
        # 헤더 출력
        header = " | ".join([col.ljust(col_width[col]) for col in columns])
        separator = "-" * len(header)
        
        self.result_text.insert(tk.END, separator + "\n")
        self.result_text.insert(tk.END, header + "\n")
        self.result_text.insert(tk.END, separator + "\n")
        
        # 결과 출력
        for row in results:
            row_str = " | ".join([str(row[col] if row[col] is not None else 'NULL').ljust(col_width[col]) for col in columns])
            self.result_text.insert(tk.END, row_str + "\n")
        
        self.result_text.insert(tk.END, separator + "\n")
        self.result_text.insert(tk.END, f"\n{len(results)}개의 행이 반환되었습니다.")
    
    def create_table_view(self, results):
        # 기존 위젯 제거
        for widget in self.table_tab.winfo_children():
            widget.destroy()
        
        if not results or len(results) == 0:
            label = tk.Label(self.table_tab, text="결과가 없습니다.")
            label.pack(padx=10, pady=10)
            return
        
        # 결과를 DataFrame으로 변환
        df = pd.DataFrame(results)
        
        # 테이블 프레임 생성
        table_frame = tk.Frame(self.table_tab)
        table_frame.pack(fill=tk.BOTH, expand=True)
        
        # 테이블 생성
        pt = Table(table_frame, dataframe=df, showtoolbar=True, showstatusbar=True)
        pt.show()
    
    def create_chart(self, chart_type):
        if not self.current_results or len(self.current_results) == 0:
            messagebox.showwarning("데이터 필요", "차트를 생성하려면 먼저 쿼리를 실행하여 데이터를 가져오세요.")
            return
        
        # 차트 설정 창 생성
        chart_window = tk.Toplevel(self)
        chart_window.title(f"{chart_type.capitalize()} 차트 설정")
        chart_window.geometry("400x300")
        chart_window.configure(bg="#f0f0f0")
        
        # 컬럼 목록 가져오기
        columns = list(self.current_results[0].keys())
        
        # 설정 프레임
        settings_frame = tk.LabelFrame(chart_window, text="차트 설정", bg="#f0f0f0")
        settings_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # X축 선택
        tk.Label(settings_frame, text="X축 (레이블):", bg="#f0f0f0").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        x_axis = ttk.Combobox(settings_frame, values=columns, state="readonly")
        x_axis.grid(row=0, column=1, padx=5, pady=5, sticky=tk.W+tk.E)
        if columns:
            x_axis.current(0)
        
        # Y축 선택
        tk.Label(settings_frame, text="Y축 (값):", bg="#f0f0f0").grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
        y_axis = ttk.Combobox(settings_frame, values=columns, state="readonly")
        y_axis.grid(row=1, column=1, padx=5, pady=5, sticky=tk.W+tk.E)
        if len(columns) > 1:
            y_axis.current(1)
        else:
            y_axis.current(0)
        
        # 차트 제목
        tk.Label(settings_frame, text="차트 제목:", bg="#f0f0f0").grid(row=2, column=0, padx=5, pady=5, sticky=tk.W)
        title_entry = tk.Entry(settings_frame)
        title_entry.grid(row=2, column=1, padx=5, pady=5, sticky=tk.W+tk.E)
        title_entry.insert(0, f"{chart_type.capitalize()} 차트")
        
        # 버튼 프레임
        button_frame = tk.Frame(chart_window, bg="#f0f0f0")
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # 생성 버튼
        create_button = tk.Button(
            button_frame, 
            text="차트 생성", 
            command=lambda: self.generate_chart(
                chart_type, 
                x_axis.get(), 
                y_axis.get(), 
                title_entry.get()
            ),
            bg="#2196F3", 
            fg="white"
        )
        create_button.pack(side=tk.RIGHT, padx=5)
        
        # 취소 버튼
        cancel_button = tk.Button(button_frame, text="취소", command=chart_window.destroy, bg="#f44336", fg="white")
        cancel_button.pack(side=tk.RIGHT, padx=5)
    
    def generate_chart(self, chart_type, x_column, y_column, title):
        if not x_column or not y_column:
            messagebox.showwarning("입력 필요", "X축과 Y축 컬럼을 선택해주세요.")
            return
        
        # 기존 차트 제거
        for widget in self.chart_tab.winfo_children():
            widget.destroy()
        
        # 데이터 준비
        df = pd.DataFrame(self.current_results)
        
        # 숫자형 데이터 확인
        if not pd.api.types.is_numeric_dtype(df[y_column]):
            try:
                df[y_column] = pd.to_numeric(df[y_column])
            except:
                messagebox.showerror("데이터 오류", f"Y축 컬럼 '{y_column}'이(가) 숫자형 데이터가 아닙니다.")
                return
        
        # 차트 생성
        fig, ax = plt.subplots(figsize=(10, 6))
        
        if chart_type == "bar":
            df.plot(kind="bar", x=x_column, y=y_column, ax=ax, legend=False)
        elif chart_type == "line":
            df.plot(kind="line", x=x_column, y=y_column, ax=ax, legend=False)
        elif chart_type == "pie":
            df.plot(kind="pie", y=y_column, labels=df[x_column], ax=ax, legend=False, autopct='%1.1f%%')
        
        ax.set_title(title)
        ax.set_xlabel(x_column)
        if chart_type != "pie":
            ax.set_ylabel(y_column)
        
        # 차트를 Tkinter 창에 표시
        chart_frame = tk.Frame(self.chart_tab)
        chart_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        canvas = FigureCanvasTkAgg(fig, master=chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        
        # 탭 전환
        self.tab_control.select(self.chart_tab)
    
    def clear_query(self):
        self.query_text.delete("1.0", tk.END)
    
    def load_query(self):
        file_path = filedialog.askopenfilename(
            title="SQL 쿼리 파일 열기",
            filetypes=[("SQL 파일", "*.sql"), ("텍스트 파일", "*.txt"), ("모든 파일", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, "r", encoding="utf-8") as file:
                    query = file.read()
                    self.query_text.delete("1.0", tk.END)
                    self.query_text.insert(tk.END, query)
                self.status_bar.config(text=f"파일 '{file_path}'을(를) 불러왔습니다.")
            except Exception as e:
                messagebox.showerror("파일 오류", f"파일을 불러오는 중 오류가 발생했습니다: {e}")
    
    def save_query(self):
        query = self.query_text.get("1.0", tk.END).strip()
        if not query:
            messagebox.showwarning("내용 없음", "저장할 쿼리가 없습니다.")
            return
        
        file_path = filedialog.asksaveasfilename(
            title="SQL 쿼리 저장",
            defaultextension=".sql",
            filetypes=[("SQL 파일", "*.sql"), ("텍스트 파일", "*.txt"), ("모든 파일", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, "w", encoding="utf-8") as file:
                    file.write(query)
                self.status_bar.config(text=f"쿼리가 '{file_path}'에 저장되었습니다.")
            except Exception as e:
                messagebox.showerror("파일 오류", f"파일을 저장하는 중 오류가 발생했습니다: {e}")
    
    def save_results(self, format_type):
        if not self.current_results or len(self.current_results) == 0:
            messagebox.showwarning("결과 없음", "저장할 결과가 없습니다.")
            return
        
        file_types = {
            "csv": [("CSV 파일", "*.csv")],
            "json": [("JSON 파일", "*.json")]
        }
        
        file_path = filedialog.asksaveasfilename(
            title=f"결과 {format_type.upper()} 저장",
            defaultextension=f".{format_type}",
            filetypes=file_types[format_type]
        )
        
        if file_path:
            try:
                if format_type == "csv":
                    df = pd.DataFrame(self.current_results)
                    df.to_csv(file_path, index=False, encoding="utf-8")
                elif format_type == "json":
                    with open(file_path, "w", encoding="utf-8") as file:
                        json.dump(self.current_results, file, ensure_ascii=False, indent=2)
                
                self.status_bar.config(text=f"결과가 '{file_path}'에 저장되었습니다.")
            except Exception as e:
                messagebox.showerror("파일 오류", f"파일을 저장하는 중 오류가 발생했습니다: {e}")
    
    def show_tables(self):
        if not self.connection:
            messagebox.showwarning("연결 필요", "먼저 데이터베이스에 연결해주세요.")
            return
        
        try:
            # 테이블 목록 쿼리
            query = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
            """
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query)
                tables = cursor.fetchall()
            
            if not tables or len(tables) == 0:
                messagebox.showinfo("테이블 목록", "데이터베이스에 테이블이 없습니다.")
                return
            
            # 테이블 목록 창 생성
            tables_window = tk.Toplevel(self)
            tables_window.title("데이터베이스 테이블 목록")
            tables_window.geometry("300x400")
            tables_window.configure(bg="#f0f0f0")
            
            # 테이블 목록 프레임
            list_frame = tk.LabelFrame(tables_window, text="테이블 목록", bg="#f0f0f0")
            list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            # 스크롤바
            scrollbar = tk.Scrollbar(list_frame)
            scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            
            # 테이블 목록 리스트박스
            table_listbox = tk.Listbox(list_frame, yscrollcommand=scrollbar.set, font=("Consolas", 11))
            table_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
            scrollbar.config(command=table_listbox.yview)
            
            # 테이블 목록 추가
            for table in tables:
                table_listbox.insert(tk.END, table["table_name"])
            
            # 버튼 프레임
            button_frame = tk.Frame(tables_window, bg="#f0f0f0")
            button_frame.pack(fill=tk.X, padx=10, pady=10)
            
            # 테이블 구조 보기 버튼
            structure_button = tk.Button(
                button_frame, 
                text="테이블 구조 보기", 
                command=lambda: self.show_table_structure(table_listbox.get(tk.ACTIVE)),
                bg="#2196F3", 
                fg="white"
            )
            structure_button.pack(side=tk.LEFT, padx=5)
            
            # 테이블 데이터 보기 버튼
            data_button = tk.Button(
                button_frame, 
                text="테이블 데이터 보기", 
                command=lambda: self.show_table_data(table_listbox.get(tk.ACTIVE)),
                bg="#4CAF50", 
                fg="white"
            )
            data_button.pack(side=tk.LEFT, padx=5)
            
            # 닫기 버튼
            close_button = tk.Button(button_frame, text="닫기", command=tables_window.destroy, bg="#f44336", fg="white")
            close_button.pack(side=tk.RIGHT, padx=5)
            
        except Exception as e:
            messagebox.showerror("오류", f"테이블 목록을 가져오는 중 오류가 발생했습니다: {e}")
    
    def show_table_structure(self, table_name):
        if not table_name:
            messagebox.showwarning("테이블 선택", "테이블을 선택해주세요.")
            return
        
        try:
            # 테이블 구조 쿼리
            query = f"""
            SELECT 
                column_name, 
                data_type, 
                character_maximum_length, 
                column_default, 
                is_nullable
            FROM 
                information_schema.columns 
            WHERE 
                table_name = '{table_name}' 
            ORDER BY 
                ordinal_position
            """
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query)
                columns = cursor.fetchall()
            
            if not columns or len(columns) == 0:
                messagebox.showinfo("테이블 구조", f"테이블 '{table_name}'의 구조 정보를 가져올 수 없습니다.")
                return
            
            # 쿼리 텍스트에 테이블 구조 쿼리 설정
            self.query_text.delete("1.0", tk.END)
            self.query_text.insert(tk.END, query)
            
            # 쿼리 실행
            self.execute_query()
            
        except Exception as e:
            messagebox.showerror("오류", f"테이블 구조를 가져오는 중 오류가 발생했습니다: {e}")
    
    def show_table_data(self, table_name):
        if not table_name:
            messagebox.showwarning("테이블 선택", "테이블을 선택해주세요.")
            return
        
        try:
            # 테이블 데이터 쿼리
            query = f"SELECT * FROM {table_name} LIMIT 100"
            
            # 쿼리 텍스트에 테이블 데이터 쿼리 설정
            self.query_text.delete("1.0", tk.END)
            self.query_text.insert(tk.END, query)
            
            # 쿼리 실행
            self.execute_query()
            
        except Exception as e:
            messagebox.showerror("오류", f"테이블 데이터를 가져오는 중 오류가 발생했습니다: {e}")
    
    def show_help(self):
        help_text = """
        PostgreSQL 쿼리 실행기 사용법
        
        1. 데이터베이스 연결
           - '데이터베이스' 메뉴에서 '연결'을 클릭하거나 상단의 'DB 연결' 버튼을 클릭합니다.
        
        2. SQL 쿼리 작성
           - 쿼리 입력 영역에 SQL 쿼리를 작성합니다.
           - 파일에서 쿼리를 불러오려면 '파일' 메뉴에서 '쿼리 불러오기'를 선택합니다.
        
        3. 쿼리 실행
           - '쿼리 실행' 버튼을 클릭하여 작성한 쿼리를 실행합니다.
        
        4. 결과 확인
           - '결과' 탭에서 텍스트 형식의 결과를 확인합니다.
           - '테이블 뷰' 탭에서 테이블 형식의 결과를 확인합니다.
           - '차트' 메뉴에서 결과를 차트로 시각화할 수 있습니다.
        
        5. 결과 저장
           - '파일' 메뉴에서 '결과 저장하기'를 선택하여 CSV 또는 JSON 형식으로 결과를 저장합니다.
        
        6. 테이블 관리
           - '데이터베이스' 메뉴에서 '테이블 목록 보기'를 선택하여 데이터베이스의 테이블 목록을 확인합니다.
           - 테이블을 선택하고 '테이블 구조 보기' 또는 '테이블 데이터 보기' 버튼을 클릭하여 테이블 정보를 확인합니다.
        """
        
        help_window = tk.Toplevel(self)
        help_window.title("사용법")
        help_window.geometry("600x500")
        help_window.configure(bg="#f0f0f0")
        
        help_text_widget = scrolledtext.ScrolledText(help_window, wrap=tk.WORD, font=("Consolas", 11))
        help_text_widget.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        help_text_widget.insert(tk.END, help_text)
        help_text_widget.config(state=tk.DISABLED)
    
    def show_about(self):
        about_text = """
        PostgreSQL 쿼리 실행기
        
        버전: 1.0.0
        
        이 프로그램은 PostgreSQL 데이터베이스에 연결하여 SQL 쿼리를 실행하고 결과를 확인할 수 있는 GUI 도구입니다.
        
        주요 기능:
        - SQL 쿼리 실행
        - 결과 테이블 뷰
        - 차트 시각화
        - 테이블 구조 및 데이터 확인
        - 결과 저장 (CSV, JSON)
        
        © 2023 Adcluster
        """
        
        messagebox.showinfo("정보", about_text)


if __name__ == "__main__":
    app = PostgreSQLGUI()
    app.mainloop()