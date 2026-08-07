import axios from "axios";
import Cookies from "universal-cookie";
import { sessionService } from "redux-react-session";
import { toast } from 'react-toastify';
const cookies = new Cookies();


// const API_BASE_URL = "http://192.168.40.20:3700";  //Local Backend;
const API_BASE_URL = "http://50.116.14.116:3700";  //Live Backend;

export const login = async (user) => {
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/login`,
    data: {
      email: user.username,
      password: user.password,
    },
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  console.log(result);
  try {
    cookies.set("TOKEN", result.data.accessToken, {
      path: "/",
    })
  } catch (error) {
  }

  // let result = {data:{accessToken:'11243dfdgfdg', user:{firstName:'Nilesh', lastName:'Patel', email:'nilesh@gmail.com'}}}
  return result.data;

}

export const register = async (user, loginUser) => {
  console.log("user", user);
  console.log("loginUser", loginUser);
  let token = cookies.get("TOKEN");
  user.modifier = loginUser.id;
  if (user.password_old) {
    user.password = (user.password && user.password !== '') ? user.password : user.password_old;
  } else {
    user.password = user.password ? user.password : "test@123";
  }
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/user/add`,
    headers: { Authorization: `Bearer ${token}` },
    data: user,
  };

  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  isApiAuthenticated(result);
  return result;

}

export const listUsers = async (user) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/user/search`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: user,
  };

  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  // console.log(result.data);
  isApiAuthenticated(result);
  return result.data;


}

export const addLeave = async (leave, loginUser) => {
  let token = cookies.get("TOKEN");
  leave.modifier = loginUser.id;
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/leave/add`,
    headers: { Authorization: `Bearer ${token}` },
    data: leave,
  };

  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  isApiAuthenticated(result);
  return result;

}

export const listLeaves = async (user) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/leave/list`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: user,
  };

  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  // console.log(result.data);
  isApiAuthenticated(result);
  return result.data;


}

export const getProfile = async (user) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/user/search/${user.id}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: user,
  };

  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  // console.log("result", result);
  isApiAuthenticated(result);
  return result.data;
}

export const updateHoursStatus = async (timesheet, user) => {
  timesheet.modifier = user.id;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/timesheet/updateHoursStatus`,
    headers: { Authorization: `Bearer ${token}` },
    data: timesheet,
  };
  console.log(configuration);
  try {
    let result = await axios(configuration);
    console.log(result);
    isApiAuthenticated(result);
    return result.data;
  } catch (error) {
    console.error("Error updating timesheet hours status:", error);
    throw error;
  }
};

export const approveHours = async (timesheet, user) => {
  timesheet.modifier = user.id;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/timesheet/approveHours`,
    headers: { Authorization: `Bearer ${token}` },
    data: timesheet,
  };
  console.log(configuration);
  try {
    let result = await axios(configuration);
    console.log(result);
    isApiAuthenticated(result);
    return result.data;
  } catch (error) {
    console.error("Error updating timesheet hours status:", error);
    throw error;
  }
};

export const finalizeHours = async (timesheet, user) => {
  timesheet.modifier = user.id;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/timesheet/finalizeHours`,
    headers: { Authorization: `Bearer ${token}` },
    data: timesheet,
  };
  console.log(configuration);
  try {
    let result = await axios(configuration);
    console.log(result);
    isApiAuthenticated(result);
    return result.data;
  } catch (error) {
    console.error("Error updating timesheet hours status:", error);
    throw error;
  }
};

export const listFinalizedTimesheets = async (user) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/timesheet/finalizedList`,
    headers: { Authorization: `Bearer ${token}` },
    data: user,
  };
  console.log(configuration);
  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const addTimesheet = async (timesheet, user) => {
  timesheet.modifier = user.id;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/timesheet/add`,
    headers: { Authorization: `Bearer ${token}` },
    data: timesheet,
  };
  console.log(configuration);
  try {
    let result = await axios(configuration);
    console.log(result);
    isApiAuthenticated(result);
    return result.data;
  } catch (error) {
    console.error("Error adding timesheet:", error);
    throw error;
  }
};



export const listTimesheet = async (user, executionDate, filterUserId) => {
  let token = cookies.get("TOKEN");
  user.executionDate = executionDate;
  user.filterUserId = filterUserId;
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/timesheet/list`,
    headers: { Authorization: `Bearer ${token}` },
    data: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      // error = new Error();
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const getTimesheetPage = async (user, executionDate, filterUserId) => {
  let token = cookies.get("TOKEN");
  user.executionDate = executionDate;
  user.filterUserId = filterUserId;
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/timesheet/page`,
    headers: { Authorization: `Bearer ${token}` },
    data: user,
  };
  // console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      // error = new Error();
      return error;
    });
  // console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const getAllTimesheet = async (user, executionDate, filterUserId, loadNext = true) => {
  let token = cookies.get("TOKEN");
  user.executionDate = executionDate;
  user.filterUserId = filterUserId;
  user.loadNext = loadNext;
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/timesheet/page`,
    headers: { Authorization: `Bearer ${token}` },
    data: user,
  };
  // console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      // error = new Error();
      return error;
    });
  // console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const listTimesheetWeeklyReport = async (user, weekFilter) => {
  user.weekFilter = weekFilter;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/timesheet/report`,
    headers: { Authorization: `Bearer ${token}` },
    data: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      // error = new Error();
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const addTask = async (task, user) => {
  task.modifier = user.id;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/task/add`,
    headers: { Authorization: `Bearer ${token}` },
    data: task,
  };
  console.log(configuration);
  try {
    let result = await axios(configuration);
    console.log(result);
    isApiAuthenticated(result);
    return result.data;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};



export const listTasks = async (user) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/task/list`,
    headers: { Authorization: `Bearer ${token}` },
    data: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      // error = new Error();
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const taskPage = async (user, startDate, endDate) => {
  user.startDate = startDate;
  user.endDate = endDate;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "GET",
    url: `${API_BASE_URL}/task/taskPage`,
    headers: { Authorization: `Bearer ${token}` },
    params: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      // error = new Error();
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const searchTasks = async (user, searchVal, date) => {
  user.searchVal = searchVal;
  user.date = date;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "GET",
    url: `${API_BASE_URL}/task/search`,
    headers: { Authorization: `Bearer ${token}` },
    params: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      // error = new Error();
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const getWeeklyTimesheet = async (user, startDay, endDay) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/timesheet/weeklyReport`,
    headers: { Authorization: `Bearer ${token}` },
    data: { user, startDay, endDay },
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      // error = new Error();
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}


export const changePassword = async (email, oldPassword, newPassword) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "put",
    url: `${API_BASE_URL}/user/changepassword`,
    headers: { Authorization: `Bearer ${token}` },
    data: {
      email: email,
      newPassword: newPassword,
      oldPassword: oldPassword
    },
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      // error = new Error();
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const logoutUser = (history) => {
  return () => {
    sessionService.deleteSession();
    sessionService.deleteUser();
    history.push("/");
    toast.success("Logout successful!");
  };
};

export const addWork = async (work, user) => {
  work.modifier = user.id;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/work/add`,
    headers: { Authorization: `Bearer ${token}` },
    data: work,
  };
  console.log(configuration);
  try {
    let result = await axios(configuration);
    console.log(result);
    isApiAuthenticated(result);
    return result.data;
  } catch (error) {
    console.error("Error adding work:", error);
    return error;
  }
};

export const listWorks = async (user) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/work/list`,
    headers: { Authorization: `Bearer ${token}` },
    params: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const listLatestWorks = async (user) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/work/latestList`,
    headers: { Authorization: `Bearer ${token}` },
    params: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const getWorkById = async (user, workId) => {
  user.workId = workId;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/work/byId`,
    headers: { Authorization: `Bearer ${token}` },
    params: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const searchWorkByName = async (user, workName) => {
  user.workName = workName;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "GET",
    url: `${API_BASE_URL}/work/search`,
    headers: { Authorization: `Bearer ${token}` },
    params: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const addClient = async (client, user) => {
  client.modifier = user.id;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/client/add`,
    headers: { Authorization: `Bearer ${token}` },
    data: client,
  };
  console.log(configuration);
  try {
    let result = await axios(configuration);
    console.log(result);
    isApiAuthenticated(result);
    return result;
  } catch (error) {
    console.error("Error adding client:", error);
    return error;
  }
};

export const listClients = async (user) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/client/list`,
    headers: { Authorization: `Bearer ${token}` },
    data: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)
    .catch((error) => {
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}



export const addProject = async (project, user) => {
  let token = cookies.get("TOKEN");
  project.modifier = user.id;
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/project/add`,
    headers: { Authorization: `Bearer ${token}` },
    data: project,
  };
  console.log(configuration);
  try {
    let result = await axios(configuration);
    console.log(result);
    isApiAuthenticated(result);
    return result.data;
  } catch (error) {
    console.error("Error adding project:", error);
    return error;
  }
};

export const listProjects = async (user) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/project/list`,
    headers: { Authorization: `Bearer ${token}` },
    data: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)

    .catch((error) => {
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const searchProjects = async (user, projectName) => {
  user.projectName = projectName;
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "GET",
    url: `${API_BASE_URL}/project/search`,
    headers: { Authorization: `Bearer ${token}` },
    params: user,
  };
  console.log(configuration);
  // make the API call
  let result = await axios(configuration)

    .catch((error) => {
      return error;
    });
  console.log(result);
  isApiAuthenticated(result);
  return result.data;
}

export const listUsefullLinks = async () => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "get",
    url: `${API_BASE_URL}/usefullLink/list`,
    headers: { Authorization: `Bearer ${token}` },
  };
  let result = await axios(configuration).catch((error) => error);
  isApiAuthenticated(result);
  return result.data;
};

export const addUsefullLink = async (linkData, user) => {
  const payload = {
    label: linkData?.label,
    link: linkData?.link,
    modifier: user?.id,
  };
  if (linkData?.id) {
    payload.id = linkData.id;
  }
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "post",
    url: `${API_BASE_URL}/usefullLink/add`,
    headers: { Authorization: `Bearer ${token}` },
    data: payload,
  };
  try {
    let result = await axios(configuration);
    console.log("result", result)
    isApiAuthenticated(result);
    return result;
  } catch (error) {
    console.error("Error saving useful link:", error);
    return error?.response || error;
  }
};

export const deleteUsefullLink = async (id) => {
  let token = cookies.get("TOKEN");
  const configuration = {
    method: "delete",
    url: `${API_BASE_URL}/usefullLink/delete/${id}`,
    headers: { Authorization: `Bearer ${token}` },
  };
  try {
    let result = await axios(configuration);
    isApiAuthenticated(result);
    return result;
  } catch (error) {
    console.error("Error deleting useful link:", error);
    return error;
  }
};

export const isApiAuthenticated = (result) => {
  if (result.response) {
    if (result.response.status === 401 || result.response.status === 403) {
      sessionService.deleteSession();
      sessionService.deleteUser();
      window.location.href = "/login";
      toast.error("Session expired. Please login again.");
      return false;
    } else {
      return true;
    }
  }
  return true;
}