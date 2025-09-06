// src/main/java/com/example/tech/exception/UnauthorizedException.java
package com.example.tech.exception;

public class UnauthorizedException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public UnauthorizedException() { super(); }
    public UnauthorizedException(String message) { super(message); }
    public UnauthorizedException(String message, Throwable cause) { super(message, cause); }
    public UnauthorizedException(Throwable cause) { super(cause); }
}
