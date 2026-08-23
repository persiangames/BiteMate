output "ecr_api_repository_url" {
  value = aws_ecr_repository.api.repository_url
}

output "ecr_gateway_repository_url" {
  value = aws_ecr_repository.gateway.repository_url
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.web.domain_name
}

output "alb_dns_name" {
  value = aws_lb.api.dns_name
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "web_bucket_name" {
  value = aws_s3_bucket.web.bucket
}

output "media_bucket_name" {
  value = aws_s3_bucket.media.bucket
}
