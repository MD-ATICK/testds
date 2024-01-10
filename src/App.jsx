import React, { useEffect, useState } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import AllRouters from "./router/Router"
import { useDispatch, useSelector } from "react-redux";
import api from "./api/api";
import { authuser, load, rootFetch, sellerLogin, unauthorize } from "./redux/reducers/authReducers";
import Loader from "./components/Loader";
import io from 'socket.io-client'
import Home from "./pages/Home";
import Login from "./auth/Login";
import Register from "./auth/Register";
import AdminLogin from "./auth/AdminLogin";

let socket;

function App() {

  const dispatch = useDispatch()
  const token = localStorage.getItem('ds-token')
  const { loading, data } = useSelector(state => state.auth)

  const authUser = async (token) => {
    dispatch(load())
    const { data, status } = await api.get('/v1/get-user', { headers: { Authorization: `Bearer ${token}` } })
    if (status === 200) {
      dispatch(authuser({ data, status }))
    }
  }

  // const rootFetch = async () => {
  //   const { data } = await api.get('/')
  //   console.log('✅get fetch dashboard', data)
  // }

  useEffect(() => {
    socket = io('http://localhost:4000')
    dispatch(rootFetch())

    if (data && socket) {
      socket.emit('add_user', data.user)
    }

    if (token && !data) {
      authUser(token)
    } else {
      unauthorize()
    }

  }, [data]);

  console.log(loading, socket)

  return (
    <>
      {loading && <Loader />}
      {
        socket ?
          <BrowserRouter>
            <AllRouters socket={socket} />
          </BrowserRouter>
          :
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Routes>
          </BrowserRouter>
      }

    </>
  )
}

export default App
