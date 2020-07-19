import { all, fork, call, put, take } from "redux-saga/effects";
import axios from "axios";

function logInAPI(data) {
  return axios.post("/api/login");
}

function* logIn(action) {
  try {
    const result = yield call(logInAPI, action.data); // 프로미스를 받음

    yield put({
      type: "LOG_IN_SUCCESS",
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: "LOG_IN_FAILURE",
      data: err.response.data,
    });
  }
}

function* watchLogin() {
  yield take("LOG_IN_REQUEST", logIn);
  // 로그인 액션이 오면 함수를 실행
}

function* watchLogOut() {
  yield take("LOG_OUT_REQUEST", logOut);
}

function logOutAPI() {
  return axios.post("/api/logout");
}

function* logOut() {
  try {
    const result = yield call(logOutAPI); // 프로미스를 받음

    yield put({
      type: "LOG_OUT_SUCCESS",
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: "LOG_OUT_FAILURE",
      data: err.response.data,
    });
  }
}

function* watchAddPost() {
  yield take("ADD_POST_REQUEST", addPost);
}

function addPostAPI() {
  return axios.post("/api/post");
}

function* addPost() {
  try {
    const result = yield call(addPostAPI);

    yield put({
      type: "ADD_POST_SUCCESS",
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: "ADD_POST_FAILURE",
      data: err.response.data,
    });
  }
}

export default function* rootSaga() {
  yield all([fork(watchLogin), fork(watchLogOut), fork(watchAddPost)]);
}
