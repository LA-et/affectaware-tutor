// import Typography from "@mui/material/Typography";
// import { Stack } from "@mui/material";
// import Divider from "@mui/material/Divider";
// import SimpleContainer from "../components/dashboard/CourseContainer";
// import { useEffect, useState } from "react";
// import Loader from "../components/utils/Loader";
// import { apiResponse } from "../utils/httpResponse";
// import { SiStrongswan } from "react-icons/si";

// function MyCourses() {
//   const [courseData, setCourseData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const jwt = localStorage.getItem("JWT")

  

//   const getCourse = async () => {

//     const payload = {
//       jwt
//     };

//     try {
//       const response = await apiResponse("/course/view_enrolled_courses", "POST", payload);
//       setCourseData(response.Success);
//       setLoading(false);
//     } catch (error) {
//       setCourseData(error.response.Error);
//     }
//   };

//   useEffect(() => {
//     getCourse();
//   }, []);

//   if (loading) {
//     return (
//       <div>
//         <Loader height="600px" />
//       </div>
//     );
//   }

//   return (
//     <>
//       {!loading && (
//         <>
//           {" "}
//           <div className='w-full'>
//           <div className='flex justify-center items-center  '>
//           <strong
//             className='p-10 mt-6 text-5xl inter text-center'
//           >
//             My Courses
//           </strong>
//           </div>
//           </div> 
//           <Divider variant="middle" />
//           <Stack spacing={10}>
//             <SimpleContainer regData={courseData} courseData={courseData}/>
//           </Stack>
//         </>
//       )}
//     </>
//   );
// }

// export default MyCourses;


import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";
import Divider from "@mui/material/Divider";
import SimpleContainer from "../components/dashboard/CourseContainer";
import { useEffect, useState } from "react";
import Loader from "../components/utils/Loader";
import { apiResponse } from "../utils/httpResponse";
import { SiStrongswan } from "react-icons/si";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";

function MyCourses() {
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const jwt = localStorage.getItem("JWT");
  const navigate = useNavigate();

 
  
    const getCourse = async () => {
  
      const payload = {
        jwt
      };
  
      try {
        const response = await apiResponse("/course/view_enrolled_courses", "POST", payload);
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
        <Loader height="600px" />
      </div>
    );
  }

  return (
    <>
      {!loading && (
        <>
          <div className='w-full'>
            <div className='flex justify-center items-center'>
              <strong className=' my-6 text-3xl inter text-center'>
                My Courses
              </strong>
            </div>
          </div>
          <Divider variant="middle" />
          {courseData.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-center min-h-[60vh] px-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="text-blue-500 mb-6"
              >
                <FaBookOpen size={80} />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-semibold mb-4 text-gray-800 text-center"
              >
                No Courses Yet
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-gray-600 text-center mb-8 max-w-md"
              >
                Start your learning journey by exploring our course catalog and enrolling in courses that interest you.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/all-courses')}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:bg-blue-600 transition-colors duration-300"
              >
                Explore Courses
              </motion.button>
            </motion.div>
          ) : (
            <Stack spacing={10}>
              <SimpleContainer regData={courseData} courseData={courseData}/>
            </Stack>
          )}
        </>
      )}
    </>
  );
}

export default MyCourses;