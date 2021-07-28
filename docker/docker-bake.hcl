variable "TAG" {
    default = "latest"
}
group "default" {
    targets = ["trello"]
}
target "trello" {
    tags = ["pitilezard/trello-cms:${TAG}"]
    platforms = ["linux/arm64", "linux/amd64"]
}