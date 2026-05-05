package main

import "testing"

func TestGreet(t *testing.T) {
	got := Greet("world")
	want := "hello, world"
	if got != want {
		t.Fatalf("Greet() = %q, want %q", got, want)
	}
}
