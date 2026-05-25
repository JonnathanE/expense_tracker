.PHONY: docs test run

docs:
	swag init -g cmd/api/main.go --output docs

run:
	go run ./cmd/api

# test:
# 	go test ./... -v

# test-coverage:
# 	go test ./... -coverprofile=coverage.out
# 	go tool cover -html=coverage.out
