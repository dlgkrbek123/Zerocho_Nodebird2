import React, { useMemo, useCallback } from "react";
import { Form, Input } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { CHANGE_NICKNAME_REQUEST } from "../reducers/user";
import useInput from "../hooks/useInput";

const NicknameEditForm = () => {
  const { me } = useSelector((state) => state.user);
  const [nickname, onChangeNickname] = useInput(me?.nickname || "");
  const dispatch = useDispatch();
  const style = useMemo(
    () => ({
      padding: "20px",
      border: "1px solid #d9d9d9",
      marginBottom: "20px",
    }),
    []
  );

  const onSubmit = useCallback(() => {
    dispatch({
      type: CHANGE_NICKNAME_REQUEST,
      data: {
        nickname,
      },
    });
  }, [nickname]);

  return (
    <Form style={style}>
      <Input.Search
        addonBefore="닉네임"
        enterButton="수정"
        value={nickname}
        onChange={onChangeNickname}
        onSearch={onSubmit}
      />
    </Form>
  );
};

export default NicknameEditForm;
