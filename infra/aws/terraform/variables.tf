variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "ecs_cluster_name" {
  type    = string
  default = "bitemate-prod"
}

variable "web_bucket_name" {
  type = string
}

variable "media_bucket_name" {
  type = string
}

variable "api_desired_count" {
  type    = number
  default = 2
}

variable "ecs_execution_role_arn" {
  type = string
}

variable "ecs_task_role_arn" {
  type = string
}

variable "ecs_service_security_group_id" {
  type = string
}

variable "api_container_secrets" {
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}
