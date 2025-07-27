from server.mcp.dispatcher import run_task_with_fallback

if __name__ == "__main__":
    user_input = input("📢 বলো, কি নিয়ে লিখবো? ")
    blog = run_task_with_fallback("blog_writer_bn", user_input)
    print(blog) 