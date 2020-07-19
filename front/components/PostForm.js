import React, { useCallback, useRef } from "react";
import { Form, Input, Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import useInput from "../hooks/useInput";
import { addPost } from "../reducers/post";

const PostForm = () => {
  const { imagePaths } = useSelector((state) => state.post);
  const [text, onChangeText] = useInput("");
  const imageRef = useRef(null);
  const dispatch = useDispatch();

  const onSubmit = useCallback(() => {
    dispatch(addPost);
    onChangeText({
      target: {
        value: "",
      },
    });
  }, []);

  const onClickImageUpload = useCallback(() => {
    imageRef.current.click();
  }, []);

  return (
    <Form
      style={{
        marginTop: "10px 0px 20px",
      }}
      encType="multipart/form-data"
      onFinish={onSubmit}
    >
      <Input.TextArea
        value={text}
        onChange={onChangeText}
        maxLength={140}
        placeholder="어떤 신기한 일이 있었나요?"
      />
      <div>
        <input type="file" multiple hidden ref={imageRef} />
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        <Button
          type="primary"
          htmlType="submit"
          style={{
            float: "right",
          }}
        >
          짹짹
        </Button>
      </div>
      <div>
        {imagePaths.map((v) => (
          <div
            key={v}
            style={{
              display: "inline-block",
            }}
          >
            <img src={v} style={{ width: "200px" }} alt={v} />
            <div>
              <Button>제거</Button>
            </div>
          </div>
        ))}
      </div>
    </Form>
  );
};

export default PostForm;
