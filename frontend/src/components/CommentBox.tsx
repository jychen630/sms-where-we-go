import { useTranslation } from "react-i18next";
import { FeedbackComment } from "wwg-api";

const CommentBox = ({ comment }: { comment: FeedbackComment }) => {
    const [t] = useTranslation();
    return (
        <>
            <h4 style={{ color: "grey" }}>{`${
                comment.sender_name === "anonymous"
                    ? t(comment.sender_name)
                    : comment.sender_name
            } 发送于 ${new Date(comment.posted_at).toLocaleString()}`}</h4>
            <p>{comment.content}</p>
        </>
    );
};

export default CommentBox;
