import Typography from '@mui/material/Typography';
import { Stack } from '@mui/material';
import Divider from '@mui/material/Divider';

import SimpleContainer from '../components/dashboard/CourseContainer';
import { useEffect, useState, useCallback } from 'react';
import Loader from '../components/utils/Loader';
import { apiResponse } from '../utils/httpResponse';

function AllCourses() {
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const jwt = localStorage.getItem("JWT")

  const getCourse = async () => {

    const payload = {
      jwt
    };

    try {
      const response = await apiResponse("/course/view_courses", "POST", payload);
      setCourseData(response.Success);
      setLoading(false);
    } catch (error) {
      setCourseData(error.response.Error);
    }
  };

  useEffect(() => {
    getCourse();
  }, []);


  if (loading) {
    return (
      <div>
        <Loader height='600px' />
      </div>
    );
  }

  return (
    <>
      {!loading && (
        <>
          {' '}
          <div className='w-full'>
          <div className='flex justify-center items-center  '>
          <strong
            className='py-7  text-3xl inter text-center'
            // style={{
            //   fontFamily:
            //     'Inter var,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji',
            // }}
          >
            All Courses
          </strong>
          </div>
          </div>
          <Divider variant='middle' />
          <Stack spacing={10}>
            <SimpleContainer courseData={courseData} />
          </Stack>
        </>
      )}
    </>
  );
}

export default AllCourses;
