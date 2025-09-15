from os.path import abspath, join, dirname
from sys import path, exc_info

base_dir = abspath(join(dirname(__file__), "../"))
path.append(base_dir)

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from Core.telegram import senderror
from Core.db import get_collections, PROJECT_NAME
from Core.auth import validate_jwt
from Model.course import *
from Core.idgen import transid, course_enrol_id
from datetime import datetime
from json import loads

course = APIRouter()

@course.post("/view_courses")
async def view_courses(l1: JWT, col: dict = Depends(get_collections)):
    try:
        try:
            response = await validate_jwt(col, l1.jwt)
        except Exception as err:
            return JSONResponse(status_code=400, content={'Error': str(err)})
        f = await col['6'].find({
            'Status': True
        }, 
        {
            '_id': 0,
            "CourseID": 1,
            "Title": 1,
            "Description": 1,
            "Thumbnail": 1
        }).to_list(None)
        return JSONResponse(content={'Success': f}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: course.py\nFunction: view_courses\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@course.post("/course_details")
async def course_details(l1: CourseID, col: dict = Depends(get_collections)):
    try:
        try:
            response = await validate_jwt(col, l1.jwt)
        except Exception as err:
            return JSONResponse(status_code=400, content={'Error': str(err)})
        if l1.courseid == "":
            return JSONResponse(content={'Error': "CourseID is required!"}, status_code=400)
        f = await col['6'].find_one({
            "CourseID": l1.courseid
        }, 
        {
            '_id': 0,
            "CourseID": 1,
            "Title": 1,
            "Description": 1,
            "Thumbnail": 1,
            "Learnings": 1,
            "Modules": 1,
            "Status": 1
        })
        if not f:
            return JSONResponse(content={'Error': "CourseID is invalid!"}, status_code=400)
        md = await col['7'].find({
            "CourseID": l1.courseid,
            "ModuleID": {
                "$in": f['Modules']
            },
            "Remedial": False
        },
        {
            "_id": 0,
            "ModuleID": 1,
            "ID": 1,
            "Title": 1,
            "Description": 1  
        }).sort([('ID', 1)]).to_list(None)
        return JSONResponse(content={'Success': f, "Modules": md}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: course.py\nFunction: course_details\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@course.post("/enrol_course")
async def enrol_course(l1: CourseID, col: dict = Depends(get_collections)):
    try:
        try:
            response = await validate_jwt(col, l1.jwt)
        except Exception as err:
            return JSONResponse(status_code=400, content={'Error': str(err)})
        username = response['Username']
        if l1.courseid == "":
            return JSONResponse(status_code=400, content={'Error': "CourseID is required!"})
        k = await col['6'].find_one({
            'CourseID': l1.courseid
        },
        {
            '_id': 0,
            "createdAt": 0,
            "updatedAt": 0,
        })
        if not k:
            return JSONResponse(content={'Error': 'Invalid CourseID!'}, status_code=400)
        if not k['Status']:
            return JSONResponse(content={'Error': 'Course currently inactive!'}, status_code=400)
        f = await col['2'].find_one({
            'Username': username,
            'CourseID': l1.courseid
        },
        {
            '_id': 0,
            'CourseID': 1
        })
        if f:
            return JSONResponse(content={'Success': 'Already enrolled in this course!'}, status_code=200)
        dt = datetime.now()    
        await col['2'].insert_one({
            'TransID': await course_enrol_id(),
            'DateTime': dt,
            'Username': username,
            'CourseID': l1.courseid,
            'Title': k['Title'],
            'Progress': {
                'PreTest': 'INCOMPLETE',
                'Modules': 'INCOMPLETE',
                'PostTest': 'INCOMPLETE'
            },
            'Score': {
                "PreTest": 0,
                "PostTest": 0
            },
            'Status': 'NOT STARTED'
        })
        return JSONResponse(content={'Success': "Course enrolled successfully!"}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: course.py\nFunction: enrol_course\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@course.post("/view_enrolled_courses")
async def view_enrolled_courses(l1: JWT, col: dict = Depends(get_collections)):
    try:
        try:
            response = await validate_jwt(col, l1.jwt)
        except Exception as err:
            return JSONResponse(status_code=400, content={'Error': str(err)})
        username = response['Username']
        f = await col['2'].aggregate([{
            '$match': {
                'Username': username
            }
        },
        {
            '$lookup': {
                'from': 'courses',
                'localField': 'CourseID',
                'foreignField': 'CourseID',
                'as': 'course'
            }
        },
        {
            '$project': {
                '_id': 0,
                "CourseID": {
                    "$arrayElemAt": ['$course.CourseID', 0]
                },
                "Title": {
                    "$arrayElemAt": ['$course.Title', 0]
                },
                "Description": {
                    "$arrayElemAt": ['$course.Description', 0]
                },
                "Thumbnail": {
                    "$arrayElemAt": ['$course.Thumbnail', 0]
                },
                "Learnings": {
                    "$arrayElemAt": ['$course.Learnings', 0]
                },
                'TransID': 1,
                'Progress': 1,
                'Status': 1
            }
        }]).to_list(None)
        return JSONResponse(content={'Success': f}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: course.py\nFunction: view_enrolled_courses\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@course.post("/course_status")
async def course_status(l1: CourseID, col: dict = Depends(get_collections)):
    try:
        try:
            response = await validate_jwt(col, l1.jwt)
        except Exception as err:
            return JSONResponse(status_code=400, content={'Error': str(err)})
        username = response['Username']
        if l1.courseid == "":
            return JSONResponse(status_code=400, content={'Error': "CourseID is required!"})
        k = await col['2'].find_one({
            'CourseID': l1.courseid,
            'Username': username
        },
        {
            '_id': 0,
            "Username": 0,
            "DateTime": 0
        })
        if not k:
            return JSONResponse(content={'Error': 'You are not enrolled in this course!'}, status_code=400)
        return JSONResponse(content={'Success': k}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: course.py\nFunction: course_status\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@course.post("/course_queue")
async def course_queue(l1: CourseID, col: dict = Depends(get_collections)):
    try:
        try:
            response = await validate_jwt(col, l1.jwt)
        except Exception as err:
            return JSONResponse(status_code=400, content={'Error': str(err)})
        username = response['Username']
        if l1.courseid == "":
            return JSONResponse(status_code=400, content={'Error': "CourseID is required!"})
        k = await col['2'].aggregate([{
            '$match': {
                'Username': username,
                'CourseID': l1.courseid
            }
        },
        {
            '$lookup': {
                'from': 'courses',
                'localField': 'CourseID',
                'foreignField': 'CourseID',
                'as': 'course'
            }
        },
        {
            '$project': {
                '_id': 0,
                "CourseID": 1,
                'TransID': 1,
                'Progress': 1,
                "PreTest": {
                    "$arrayElemAt": ['$course.PreTest', 0]
                },
                "PostTest": {
                    "$arrayElemAt": ['$course.PostTest', 0]
                },
                "Modules": {
                    "$arrayElemAt": ['$course.Modules', 0]
                }, 
                'Title': {
                    "$arrayElemAt": ['$course.Title', 0]
                }, 
                'Description': {
                    "$arrayElemAt": ['$course.Description', 0]
                }, 
                'Thumbnail': {
                    "$arrayElemAt": ['$course.Thumbnail', 0]
                }, 
                'Status': 1
            }
        }]).to_list(None)
        k = k[0]
        if not k:
            return JSONResponse(content={'Error': 'You are not enrolled in this course!'}, status_code=400)
        if k['Status'] == 'COMPLETE':
            return JSONResponse(content={'Success': 'You have successfully completed the course!'}, status_code=200)
        if k['Status'] == 'NOT STARTED':
            await col['2'].update_one({
                'Username': username,
                'CourseID': l1.courseid
            },
            {
                '$set': {
                    'Status': 'STARTED'
                }
            })
            return JSONResponse(content={'Success': 'Congratulations! You have now started the course. All the best!'}, status_code=200)
        data = {
            'Course_Title': k['Title'],
            'Course_Description': k['Description'],
            'Course_Thumbnail': k['Thumbnail'],
            'CourseID': l1.courseid
        }
        if k['Progress']['PreTest'] == 'INCOMPLETE':
            data['TestType'] = 'PreTest'
            data['TestID'] = k['PreTest']
            qna = await col['9'].find({
                'Username': username,
                'CourseID': l1.courseid,
                'TestID': k['PreTest']
            }, 
            {
                '_id': 0,
                'DateTime': 0,    
            }).to_list(None)
            q = await col['8'].find_one({
                'CourseID': l1.courseid,
                'Type': 'PreTest',
                'ID': k['PreTest']
            }, 
            {
                '_id': 0,
                'Questions': 1,    
            })
            if len(qna)<len(q['Questions']):
                data['ID'] = q['Questions'][len(qna)]['ID']
                data['Question'] = q['Questions'][len(qna)]['Question']
                data['Options'] = q['Questions'][len(qna)]['Options']
                data['Question_Number'] = len(qna) + 1
                data['Total_Questions'] = len(q['Questions'])
            else:
                total_score = await col['9'].aggregate([{
                    '$match': {
                        'Username': username,
                        'CourseID': l1.courseid,
                        'TestID': k['PreTest'],
                        "TestType": "PreTest"
                    }
                },
                {
                    '$group': {
                        '_id': None,
                        'Total': {
                            '$sum': {
                                '$cond': {
                                    'if': '$Right',
                                    'then': 1,
                                    'else': 0
                                }
                            }
                        }
                    }
                },
                {
                    '$project': {
                        '_id': 0,
                        'Total': 1
                    }
                }]).to_list(None)
                total_score = total_score[0]['Total']*100/len(q['Questions'])
                await col['2'].update_one({
                    'Username': username,
                    'CourseID': l1.courseid
                },
                {
                    '$set': {
                        'Progress.PreTest': 'COMPLETE',
                        'Score.PreTest': total_score
                    }
                })
                return JSONResponse(content={'Success': 'PreTest completed successfully!'}, status_code=200)
        elif k['Progress']['Modules'] == 'INCOMPLETE':
            data['TestType'] = 'Modules'
            mod = await col['7'].find({
                'CourseID': l1.courseid,
                'ModuleID': {
                    "$in": k['Modules']
                }
            }, 
            {
                '_id': 0,
            }).sort([('ID', 1)]).to_list(None)
            j = 0
            while j < len(mod):
                i = mod[j]
                total_score = 0
                data['ModuleID'] = i['ModuleID']
                course_type = 'Remedial' if i['Remedial'] else 'Normal'
                data['Course_Type'] = course_type
                data['Module_Name'] = i['Title']
                data['Module_Description'] = i['Description']
                umod = await col['3'].find_one({
                    'Username': username,
                    'CourseID': l1.courseid,
                    'ModuleID': i['ModuleID'],
                    'Course_Type': course_type
                },
                {
                    '_id': 0,
                    'ModuleID': 1,
                    'Module': 1,
                    'Quiz': 1,
                    'Score': 1,
                    'Status': 1,
                    'Remedial': 1
                })
                if not umod:
                    data['Content_Type'] = i['Type']
                    data['URL'] = i['URL']
                    return JSONResponse(content={'Success': data}, status_code=200)
                if umod['Status'] == 'COMPLETE':
                    if course_type == 'Normal':
                        if umod['Remedial'] == 'NOT REQUIRED':
                            j = j + 1
                    j = j + 1
                    continue
                if umod['Module'] == 'INCOMPLETE':
                    data['Content_Type'] = i['Type']
                    data['URL'] = i['URL']
                    return JSONResponse(content={'Success': data}, status_code=200)
                if umod['Quiz'] == 'INCOMPLETE':
                    if len(i['Quiz']) > 0:
                        for l in range(len(i['Quiz'])):
                            quiza = await col['10'].find_one({
                                'Username': username,
                                'CourseID': l1.courseid,
                                'ModuleID': i['ModuleID'],
                                'QuizID': i['Quiz'][l],
                                'Course_Type': course_type
                            },
                            {
                                '_id': 0,
                                'DateTime': 0
                            })
                            if not quiza:
                                quiz = await col['4'].find_one({
                                    'CourseID': l1.courseid,
                                    'ModuleID': i['ModuleID'],
                                    'QuizID': i['Quiz'][l]
                                },
                                {
                                    '_id': 0,
                                    'Question': 1,
                                    'Options': 1
                                })
                                data['QuizID'] = i['Quiz'][l]
                                data['Question'] = quiz['Question']
                                data['Options'] = quiz['Options']
                                data['Content_Type'] = 'Quiz'
                                data['Question_Number'] = l + 1
                                data['Total_Questions'] = len(i['Quiz'])
                                return JSONResponse(content={'Success': data}, status_code=200)
                        total_score = await col['10'].aggregate([{
                            '$match': {
                                'Username': username,
                                'CourseID': l1.courseid,
                                'ModuleID': i['ModuleID'],
                                'Course_Type': course_type
                            }
                        },
                        {
                            '$group': {
                                '_id': None,
                                'Total': {
                                    '$sum': '$Score'
                                }
                            }
                        },
                        {
                            '$project': {
                                '_id': 0,
                                'Total': 1
                            }
                        }]).to_list(None)
                        total_score = total_score[0]['Total']*100/len(i['Quiz'])
                        outof  = 100
                        if total_score >= 40:
                            remedial = 'NOT REQUIRED'
                        else:
                            if course_type == 'Normal':
                                remedial = 'REQUIRED'
                            else:
                                remedial = 'NOT REQUIRED'
                    else:
                        total_score = 0
                        outof = 0
                        remedial = 'NOT REQUIRED'
                    await col['3'].update_one({
                        'Username': username,
                        'CourseID': l1.courseid,
                        'ModuleID': i['ModuleID'],
                        'Course_Type': course_type
                    },
                    {
                        '$set': {
                            'Quiz': 'COMPLETE',
                            'Score': total_score,
                            'Remedial': remedial,
                            'Status': 'COMPLETE'
                        }
                    })
                    data['Message'] = 'Quiz completed successfully!'
                    data['Score'] = total_score
                    data['Remedial'] = remedial
                    data['Outof'] = outof
                    return JSONResponse(content={'Success': data}, status_code=200)
                j=j+1
            await col['2'].update_one({
                'Username': username,
                'CourseID': l1.courseid
            },
            {
                '$set': {
                    'Progress.Modules': 'COMPLETE'
                }
            })
            return JSONResponse(content={'Success': 'Modules completed successfully!'}, status_code=200)
        elif k['Progress']['PostTest'] == 'INCOMPLETE':
            data['TestType'] = 'PostTest'
            data['TestID'] = k['PostTest']
            qna = await col['9'].find({
                'Username': username,
                'CourseID': l1.courseid,
                'TestID': k['PostTest']
            }, 
            {
                '_id': 0,
                'DateTime': 0,    
            }).to_list(None)
            q = await col['8'].find_one({
                'CourseID': l1.courseid,
                'Type': 'PostTest',
                'ID': k['PostTest']
            }, 
            {
                '_id': 0,
                'Questions': 1,    
            })
            if len(qna)<len(q['Questions']):
                data['ID'] = q['Questions'][len(qna)]['ID']
                data['Question'] = q['Questions'][len(qna)]['Question']
                data['Options'] = q['Questions'][len(qna)]['Options']
                data['Question_Number'] = len(qna) + 1
                data['Total_Questions'] = len(q['Questions'])
            else:
                total_score = await col['9'].aggregate([{
                    '$match': {
                        'Username': username,
                        'CourseID': l1.courseid,
                        'TestID': k['PostTest'],
                        "TestType": "PostTest"
                    }
                },
                {
                    '$group': {
                        '_id': None,
                        'Total': {
                            '$sum': {
                                '$cond': {
                                    'if': '$Right',
                                    'then': 1,
                                    'else': 0
                                }
                            }
                        }
                    }
                },
                {
                    '$project': {
                        '_id': 0,
                        'Total': 1
                    }
                }]).to_list(None)
                total_score = total_score[0]['Total']*100/len(q['Questions'])
                await col['2'].update_one({
                    'Username': username,
                    'CourseID': l1.courseid
                },
                {
                    '$set': {
                        'Progress.PostTest': 'COMPLETE',
                        'Status': 'COMPLETE',
                        'Score.PostTest': total_score
                    }
                })
                return JSONResponse(content={'Success': 'You have completed this course successfully!'}, status_code=200)
        return JSONResponse(content={'Question': data}, status_code=200)
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: course.py\nFunction: course_queue\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

@course.post("/completion_status")
async def completion_status(l1: Submit, col: dict = Depends(get_collections)):
    try:
        try:
            response = await validate_jwt(col, l1.jwt)
        except Exception as err:
            return JSONResponse(status_code=400, content={'Error': str(err)})
        username = response['Username']
        if l1.courseid == "":
            return JSONResponse(status_code=400, content={'Error': "CourseID is required!"})
        g = await col['2'].find_one({
            'Username': username,
            'CourseID': l1.courseid
        },
        {
            '_id': 0,
            "CourseID": 1,
            'Status': 1
        })
        if not g:
            return JSONResponse(status_code=400, content={'Error': "You haven't enrolled for the course yet!"})
        if g['Status'] == 'COMPLETED':
            return JSONResponse(status_code=400, content={'Error': "You have already completed the course!"})
        if l1.testtype == "":
            return JSONResponse(status_code=400, content={'Error': "Testtype is required!"})
        if l1.testtype in ['PreTest', 'PostTest']:
            if l1.testid == "":
                return JSONResponse(status_code=400, content={'Error': "TestID is required!"})
            if l1.questionid == "":
                return JSONResponse(status_code=400, content={'Error': "QuestionID is required!"})
            if l1.question == "":
                return JSONResponse(status_code=400, content={'Error': "Question is required!"})
            if l1.answer == "":
                return JSONResponse(status_code=400, content={'Error': "Answer is required!"})
            tid = await transid()
            f = await col['8'].find_one({
                'CourseID': l1.courseid,
                'ID': l1.testid,
                'Type': l1.testtype
            }, 
            {
                '_id': 0,
                'Questions': 1
            })
            if not f:
                return JSONResponse(status_code=400, content={'Error': "Invalid TestID!"})
            if f['Questions'][int(l1.questionid) - 1]['Question'] != l1.question:
                return JSONResponse(status_code=400, content={'Error': "Invalid Question!"})
            right = False
            if f['Questions'][int(l1.questionid) - 1]['Answer'] == l1.answer:
                right = True
            ff = await col['9'].find_one({
                'Username': username,
                'CourseID': l1.courseid,
                'TestID': l1.testid,
                'TestType': l1.testtype,
                'QuestionID': l1.questionid,
                'Question': l1.question
            },
            {
                '_id': 0,
                'TransID': 1
            })
            if ff:
                return JSONResponse(status_code=400, content={'Error': "Question already answered!"})
            await col['9'].insert_one({
                'TransID': tid,
                'DateTime': datetime.now(),
                'Username': username,
                'CourseID': l1.courseid,
                'TestType': l1.testtype,
                'TestID': l1.testid,
                'QuestionID': l1.questionid,
                'Question': l1.question,
                'Answer': l1.answer,
                'Correct_Answer': f['Questions'][int(l1.questionid) - 1]['Answer'],
                'Right': right
            })
            return JSONResponse(status_code=200, content={'Success': "Submitted successfully!"})
        elif l1.testtype == 'Modules':
            if l1.moduleid == "":
                return JSONResponse(status_code=400, content={'Error': "ModuleID is required!"})
            if l1.coursetype == "":
                return JSONResponse(status_code=400, content={'Error': "Course Type is required!"})
            if l1.content_type == "":
                return JSONResponse(status_code=400, content={'Error': "Content Type is required!"})
            if l1.content_type in ['Video', 'Notes', 'Image']:
                await col['3'].insert_one({
                    'TransID': await transid(),
                    'DateTime': datetime.now(),
                    'Username': username,
                    'CourseID': l1.courseid,
                    'ModuleID': l1.moduleid,
                    'Course_Type': l1.coursetype,
                    'Content_Type': l1.content_type,
                    'Module': 'COMPLETE',
                    'Score': 0,
                    'Remedial': '',
                    'Quiz': 'INCOMPLETE',
                    'Status': 'INCOMPLETE'
                })
            elif l1.content_type == 'Quiz':
                if l1.quizid == "":
                    return JSONResponse(status_code=400, content={'Error': "QuizID is required!"})
                if l1.question == "":
                    return JSONResponse(status_code=400, content={'Error': "Question is required!"})
                if l1.answer == "":
                    return JSONResponse(status_code=400, content={'Error': "Answer is required!"})
                f = await col['4'].find_one({
                    'CourseID': l1.courseid,
                    'ModuleID': l1.moduleid,
                    'QuizID': l1.quizid
                },
                {
                    '_id': 0,
                    'Question': 1,
                    'Answer': 1,
                    'Explaination': 1,
                    'Correct_Explaination': 1,
                    'Course_Type': 1
                })
                if not f:
                    return JSONResponse(status_code=400, content={'Error': "Invalid QuizID!"})
                if f['Question'] != l1.question:
                    return JSONResponse(status_code=400, content={'Error': "Invalid Question!"})
                right = False
                score = 0
                explaination = f['Explaination']
                if f['Answer'] == l1.answer:
                    right = True
                    score = 1
                    explaination = f['Correct_Explaination']
                ff = await col['10'].find_one({
                    'Username': username,
                    'CourseID': l1.courseid,
                    'ModuleID': l1.moduleid,
                    'QuizID': l1.quizid,
                    'Question': l1.question,
                    'Course_Type': f['Course_Type']
                },
                {
                    '_id': 0,
                    'TransID': 1
                })
                if not ff:
                    await col['10'].insert_one({
                        'TransID': await transid(),
                        'DateTime': datetime.now(),
                        'Username': username,
                        'CourseID': l1.courseid,
                        'ModuleID': l1.moduleid,
                        'QuizID': l1.quizid,
                        'Question': l1.question,
                        'Answer': l1.answer,
                        'Correct_Answer': f['Answer'],
                        'Course_Type': f['Course_Type'],
                        'Score': score,
                        'Course_Type': l1.coursetype,
                        'Status': True
                    })
                    data = {
                        'Message': "Submitted successfully!", 
                        'Right': right, 
                        'Explaination': explaination, 
                        'Score': score, 
                        'Answer': l1.answer, 
                        'Correct_Answer': f['Answer']
                    }
                    return JSONResponse(status_code=200, content={'Success': data})  
                else:
                    return JSONResponse(status_code=400, content={'Error': "Question already answered!"})
            else:
                return JSONResponse(status_code=400, content={'Error': "Invalid Content Type!"})
            return JSONResponse(status_code=200, content={'Success': "Submitted successfully!"})
    except Exception as err:
        exc_type, exc_obj, exc_tb = exc_info()
        await senderror(f'ERROR!\nProject: {PROJECT_NAME}\nFolder: API\nFile: course.py\nFunction: completion_status\nType: {exc_type.__name__}\nLine: {exc_tb.tb_lineno}\nError: {err}')
        return JSONResponse(content={'Error': f'Error occurred!'}, status_code=400)

