#ifndef DATA_BASE_H
#define DATA_BASE_H

#include <vector>
#include <iostream>
#include <string>
#include <sstream>
#include <Windows.h>
#include "sqlite3.h"
using namespace std;
#define PRINT_SQL 0
#define PRINT_ALART 0	
////////////////// 转码 ///////////////////
string GBKToUTF8(const string& strGBK)
{
//	return strGBK;
	string strOutUTF8 = "";
	WCHAR * str1;
	int n = MultiByteToWideChar(CP_ACP, 0, strGBK.c_str(), -1, NULL, 0);
	str1 = new WCHAR[n];
	MultiByteToWideChar(CP_ACP, 0, strGBK.c_str(), -1, str1, n);
	n = WideCharToMultiByte(CP_UTF8, 0, str1, -1, NULL, 0, NULL, NULL);
	char * str2 = new char[n];
	WideCharToMultiByte(CP_UTF8, 0, str1, -1, str2, n, NULL, NULL);
	strOutUTF8 = str2;
	delete[]str1;
	delete[]str2;
	return strOutUTF8;
}
string UTF8ToGBK(const string &UTF8_str) {
//	return UTF8_str;
	int len = MultiByteToWideChar(CP_UTF8, 0, UTF8_str.c_str(), -1, NULL, 0);
	wchar_t* wGBK_str = new wchar_t[len + 1];
	memset(wGBK_str, 0, len * 2 + 2);
	MultiByteToWideChar(CP_UTF8, 0, UTF8_str.c_str(), -1, wGBK_str, len);
	len = WideCharToMultiByte(CP_ACP, 0, wGBK_str, -1, NULL, 0, NULL, NULL);
	char* GBK_str = new char[len + 1];
	memset(GBK_str, 0, len + 1);
	WideCharToMultiByte(CP_ACP, 0, wGBK_str, -1, GBK_str, len, NULL, NULL);
	string strTemp(GBK_str);
	if (wGBK_str) delete[] wGBK_str;
	if (GBK_str) delete[] GBK_str;
	return strTemp;
}

///////////////// sql转义 /////////////////
string  SqlTransfer(const string& str){
	string ret = str;
	string temp = "'";
	for (int i = 0; i < ret.size(); i++) {
		if (ret[i] == temp[0]) {
			ret.insert(i, temp);
			i++;
		}
	}
	return ret;
}

class table{
public:
    class word{
    public:
        string name;
        string value;
        word(string a,string b){
			name = a;
            value = b;
        }
    };
    bool allisNumber(string a)
    {
        for(int i = 0;i < a.size(); i++)
            if(a[i] < 48 || a[i] > 57)
                return 0;
        return 1;
    }
    bool isNull(table &b)
    {
        if(b.begin()==b.end())
            return 1;
        return 0;
    }
public:
    vector<word> list;
    
    vector<word>::iterator begin() {
        return list.begin();
    }
    vector<word>::iterator end() {
        return list.end();
    }
    
	// 获取引用
	string OUT_OF_RANGE;
	string& operator[](string name) {
		if (name.size()) {
			for (int i = 0; i < list.size(); i++) {
				if (list[i].name == name) {
					return list[i].value;
				}
			}
		}
		cerr << "operator["<<name<<"] OUT_OF_RANGE" << endl;
		return OUT_OF_RANGE;
	}

    // 构造函数

	table(const vector<word>& vec = vector<word>()) {
		list = vec;
	}
    
	void display(ostream& out) {
		for (auto& word : (*this)){
			out << word.name << ":" << word.value << "\t";
		}
	}

	friend ostream& operator<<(ostream& out, table& data) {
		data.display(out);
		return out;
	}

	//void display(ostringstream& out) {
	//	for (auto& word : (*this)) {
	//		out << word.name << ":" << word.value << "\t";
	//	}
	//}

	//friend ostringstream& operator<<(ostringstream& out, table data) {
	//	data.display(out);
	//	return out;
	//}

    void operator = (const vector<string>& vec){
		list.clear();
        for (int i = 1; i < vec.size(); i += 2){
            push(vec[i - 1], vec[i]);
        }
    }
    
    void push(string name,string value){
        list.push_back(word(name,value));
    }
    
    string insertStr(string sheetName)
    {
        string in = "INSERT INTO " + sheetName + " ('" + list[0].name;
        for (int i = 1; i < list.size(); i++)
        {
            in += "', '" + list[i].name;
        }
        in += "') VALUES('" + list[0].value;
        for(int i = 1;i<list.size();i++)
        {
            in += "', '" + list[i].value;
        }
        in += "');";
        
        return in;
    }
    
    string searchStr(string sheetName,table &a,table &b,bool fuzzy = true)
    {
        string in = "SELECT " + a.list[0].name;
        for (int i = 1; i < a.list.size(); i++)
        {
            in += ", " + a.list[i].name;
        }
        in += " from " + sheetName + " where " + list[0].name + " LIKE '%" + list[0].value + "%'" ;
        for(int i = 1; i< list.size(); i++)
        {
			in += " and " + list[i].name + " LIKE '";
			if (fuzzy)in += "%" + list[i].value + "%'";
			else in += list[i].value + "'";
        }
        
        if(!isNull(b)){
            in += " ORDER BY ";
            for(int i = 0; i< list.size(); i++)
            {
                in += "(length(" + list[i].name + ")-length('" + list[i].value + "')),";
            }
            
            for(int i = 0; i < b.list.size() - 1; i++)
            {
                if (i != 0)in += ",";
                in += b.list[i].name + ' ' + b.list[i].value;
            }
            
            if (b.list.size()){
                if (allisNumber(b.list[b.list.size() - 1].name) && allisNumber(b.list[b.list.size() - 1].value))
                    in += " LIMIT " + b.list[b.list.size() - 1].name + " OFFSET " + b.list[b.list.size() - 1].value;
                else
                    in += ", " + b.list[b.list.size() - 1].name + ' ' + b.list[b.list.size() - 1].value;
            }
        }
        
        in += ';';
        return in;
    }
    
    string deleteStr(string sheetName)
    {
        string in = "DELETE from " + sheetName + " where "+list[0].name+" = '"+list[0].value+"'";
        for(int i =1;i<list.size();i++)
        {
            in += " and " + list[i].name+" = '"+list[i].value+"'";
        }
        in += ';';
        return in;
    }
    
    string modifyStr(string sheetName,table &a)
    {
        string in = "UPDATE " + sheetName + " set "+list[0].name+" = '"+list[0].value+"'";
        for(int i =1;i<list.size();i++)
        {
            in += "," + list[i].name+" = '"+list[i].value+"'";
        }
        in += " where "+a.list[0].name+" = '"+a.list[0].value+"'";

        for(int i =1;i<a.list.size();i++)
        {
            in += " and " + a.list[i].name+" = '"+a.list[i].value+"'";
        }
        in += ";";
        return in;
    }
    
    string index(string sheetName,string index)
    {
        string in = "CREATE INDEX " + index +" ON " + sheetName + "("+list[0].name;
        for(int i =1;i<list.size();i++)
        {
            in += "," + list[i].name;
        }
        in += ");";
        return in;
    }
};

typedef table DataBaseInfo;
typedef sqlite3* DataBase;

class infoList{
public:
    table header;
    vector<table> data;
	void clear() {
		for (auto& info:data) {
			info.list.clear();
			for (auto & word : info.list) {
			}
		}
	}
	void display(ostream& out) {
		for (auto &line : data)
			line.display(out);
	}
	friend ostream& operator<<(ostream& out, infoList& list) {
		list.display(out);
		return out;
	}
};

static int callback(void *data, int argc, char **argv, char **azColName)
{
    fprintf(stderr, "%s: ", (const char*)data);
    for(int i=0; i < argc; i++){
        printf("%s = %s\n", azColName[i], argv[i] ? argv[i] : "NULL");
    }
    std::cout<<endl;
    return 0;
}

sqlite3* connectDataBase(sqlite3* &db,string dataBaseName)
{
    char *zErrMsg = nullptr;
    
    int a = sqlite3_open(dataBaseName.c_str(), &db);
    if(a!= SQLITE_OK){
        fprintf(stderr, "Can't open database: %s\n", sqlite3_errmsg(db));
        sqlite3_free(zErrMsg);
        return NULL;
    }
	if (PRINT_ALART)
	    fprintf(stdout, "Opened database successfully\n");
	//	test
	sqlite3_exec(db, "PRAGMA synchronous = OFF; ", 0, 0, 0);		// 130ps to 400ps
	sqlite3_exec(db, "begin;", 0, 0, 0);
    return db;
}

void dataBaseBegin(sqlite3 *db) {
	sqlite3_exec(db, "begin;", 0, 0, 0);
}

void dataBaseEnd(sqlite3 * db) {
	sqlite3_exec(db, "commit;", 0, 0, 0);
}

int breakDataBase(sqlite3 *db)
{
    int ret = 0;
    ret = sqlite3_close(db);
    if ( ret == SQLITE_BUSY ){
        return false;
    }
    return true;
}

int createSheet(sqlite3 *db,string sheetName)
{
    char *zErrMsg = nullptr;
    int rc;
    
    string sql("CREATE TABLE " + sheetName +
               "(ID            INTEGER PRIMARY KEY AUTOINCREMENT,"
               "NAME           TEXT    NOT NULL,"
               "TIME           TEXT,"
               "EXT            TEXT    NOT NULL,"
               "ADDRESS        TEXT,"
			   "KEYWORD        TEXT);");
	/////////////////////GBKToUTF8////////////////
	sql = GBKToUTF8(sql);

    rc = sqlite3_exec(db, sql.c_str(), callback, 0, &zErrMsg);
    if( rc != SQLITE_OK ){
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
        return false;
    }
    
	if (PRINT_ALART)
	    fprintf(stdout, "Table created successfully\n");
    return true;
}

int displayTable(sqlite3 *db,string sheetName)
{
    char *zErrMsg = nullptr;
    const char* data = "Callback function called";
    int rc;
    
    string sql("SELECT * from " + sheetName + ";");
	/////////////////////GBKToUTF8////////////////
	sql = GBKToUTF8(sql);

    rc = sqlite3_exec(db, sql.c_str(), callback, (void*)data, &zErrMsg);
    if( rc != SQLITE_OK ){
        fprintf(stderr, "Error SQL: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
        return false;
    }
    
	if (PRINT_ALART)
	    fprintf(stdout, "successfully operation done\n");
    return true;
}

int insertInfo(sqlite3 *db,string sheetName,table &temp)
{
    char *zErrMsg = nullptr;
    int rc;
	string sql;
	/////////////////////GBKToUTF8////////////////
	sql = GBKToUTF8(temp.insertStr(sheetName));

    rc = sqlite3_exec(db, sql.c_str(), callback, 0, &zErrMsg);
    if( rc != SQLITE_OK ){
        sqlite3_free(zErrMsg);
		for (auto& word : temp) {
			word.value = SqlTransfer(word.value);
		}
		sql = GBKToUTF8(temp.insertStr(sheetName));
		rc = sqlite3_exec(db, sql.c_str(), callback, 0, &zErrMsg);

		if (rc != SQLITE_OK) { //仍然失败
			cout << UTF8ToGBK(sql) << endl;
			cout << temp << endl;
			fprintf(stderr, "SQL error: %s\n", zErrMsg);
			std::cout << sql.c_str() << endl;
			sqlite3_free(zErrMsg);
			return false;
		}
    }
	if (PRINT_ALART)
	    fprintf(stdout, "Records created successfully\n");
    return true;
}

int searchInfo(sqlite3 *db,string sheetName,table &order,table &key,infoList &resultVec,bool fuzzy = true)
{
    char *zErrMsg = nullptr;
    int rc,flag = 0,nRow,nCol;
    char **pResult;
    table a;

    string sql(key.searchStr(sheetName,resultVec.header,order,fuzzy));
	//cout << "========== sql ==========\n" << sql << endl;

	/////////////////////GBKToUTF8////////////////
	sql = GBKToUTF8(sql);
    
    rc = sqlite3_get_table(db,sql.c_str(),&pResult,&nRow,&nCol,&zErrMsg);
    
    if( rc != SQLITE_OK ){
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
    }else{
        flag = 1;
    }
    
	//	数组->Info向量
	int pointer = resultVec.header.list.size();
    for(int i=0;i<nRow;i++)
    {
		DataBaseInfo temp;
		for (int j = 0; j < nCol; j++) {
			/////////////////////GBKToUTF8////////////////
			temp.push(resultVec.header.list[j].name, UTF8ToGBK(string(pResult[pointer++])));
		}
		resultVec.data.emplace_back(temp);
    }

    sqlite3_free_table(pResult);
    return flag;
}

int deleteInfo(sqlite3 *db,string sheetName,table &key)
{
    char *zErrMsg = nullptr;
    int rc;
    const char* data = "Callback function called";

    string sql(key.deleteStr(sheetName));

	/////////////////////GBKToUTF8////////////////
	sql = GBKToUTF8(sql);

    rc = sqlite3_exec(db, sql.c_str(), callback, (void*)data, &zErrMsg);
    if( rc != SQLITE_OK ){
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
        return false;
    }
    
	if (PRINT_ALART)fprintf(stdout, "Delete data successfully\n");
    return true;
}

int modifyInfo(sqlite3 *db,string sheetName,table &key,table &newInfo)
{
    char *zErrMsg = nullptr;
    int rc;
    const char* data = "Callback function called";
    
    string sql(newInfo.modifyStr(sheetName,key));
	/////////////////////GBKToUTF8////////////////
	sql = GBKToUTF8(sql);

    rc = sqlite3_exec(db, sql.c_str(), callback, (void*)data, &zErrMsg);
    if( rc != SQLITE_OK ){
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
        return false;
    }


	if (PRINT_ALART)
	    fprintf(stdout, "Modify data successfully\n");
    return true;
}

int createIndex(sqlite3 *db,string sheetName,table &key,string index)
{
    char *zErrMsg = nullptr;
    int rc;
    
    string sql(key.index(sheetName,index));
    
    rc = sqlite3_exec(db, sql.c_str(), callback, 0, &zErrMsg);
    if( rc != SQLITE_OK ){
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
        return false;
    }
    
	if (PRINT_ALART)
	    fprintf(stdout, "Create index successfully\n");
    return true;
}

int deleteIndex(sqlite3 *db,string sheetName,string indexName)
{
    char *zErrMsg = nullptr;
    int rc;
    
    string sql("DROP INDEX " + indexName);
    
    rc = sqlite3_exec(db, sql.c_str(), callback, 0, &zErrMsg);
    if( rc != SQLITE_OK ){
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
        return false;
    }
    
	if (PRINT_ALART)
	    fprintf(stdout, "Delete index successfully\n");
    return true;
}

int showIndex(sqlite3 *db)
{
    char *zErrMsg = nullptr;
    int rc;
    
    string sql("SELECT name,tbl_name FROM SQLITE_MASTER WHERE type = 'index';");
    
    rc = sqlite3_exec(db, sql.c_str(), callback, 0, &zErrMsg);
    if( rc != SQLITE_OK ){
        fprintf(stderr, "SQL error: %s\n", zErrMsg);
        sqlite3_free(zErrMsg);
        return false;
    }
    
	if (PRINT_ALART)
	    fprintf(stdout, "show index successfully\n");
    return true;
}

//int main()
//{
//    cout << "\n======= 数据库交互 =======\n" << endl;
//
//    DataBase db = NULL;
//    string sheetName = "testSheet";
//    string dataBaseName = "testDataBase.db";
//    string indexName = "new_Index";
//    
//    connectDataBase(db, dataBaseName);    //    建立库连接 指针 名称 *路径
//    
//    createSheet(db, sheetName);        //    创建指定表 数据库 表名
//    
//    vector<string> tempVec = {
//        "NAME", "testName",
//        "EXT", "txt",
//        "ADDRESS", "testPath",
//        "TIME", "testTime"
//    };
//    DataBaseInfo temp;
//    temp = tempVec;
//    
//    insertInfo(db, sheetName, temp);        //    向指定表插入信息 数据库 表名 信息
//    
//    //    temp.list[0].value = "0";
//    temp.list[0].value = "testName2";
//    
//    insertInfo(db, sheetName, temp);
//    //    搜索
//    infoList resultVec;
//    DataBaseInfo key,newInfo,index,order;
//    
//    resultVec.header.push("ID", "1");
//    resultVec.header.push("NAME", "testName");
//    
//    key.push("NAME", "testName");
//    key.push("EXT", "txt");
//    order.push("NAME", "ASC");
//    order.push("ID", "DESC");
//    order.push("3", "2");
//    index.push("NAME", "testName");
//    index.push("EXT", "txt");
//    newInfo.push("NAME", "40002.mp3");
//
//    createIndex(db,sheetName,index,indexName);
//    showIndex(db);
//    deleteIndex(db,sheetName,indexName);
//    
//    searchInfo(db, sheetName, order, key, resultVec);
//    deleteInfo(db, sheetName, key);
//    modifyInfo(db, sheetName, key, newInfo);
//    
//    searchInfo(db, sheetName, order, key, resultVec);
//    cout << "---   display   ---" << endl;
//    displayTable(db, sheetName);
//    cout << "--- display end ---" << endl;
//    
//    for (auto& info : resultVec.data) {
//        for (auto& word : info) {
//            cout << word.name << ":" << word.value << " ";
//        }
//        cout << endl;
//    }
//    
//    resultVec.data.clear();
//    searchInfo(db, sheetName, order, key, resultVec);
//    
//    /////////////// 显示查找结果 //////////////
//    
//    for (auto& info : resultVec.data) {
//        for (auto& word : info) {
//            cout << word.name << ":" << word.value << " ";
//        }
//        cout << endl;
//    }
//    
//    //DataBaseInfo dInfo;
//    //dInfo.push("ID", "testName2");
//    //deleteInfo(db, sheetName, dInfo);
//    
//    breakDataBase(db);
//    
//    system("pause");
//}
#endif // !DATA_BASE_H