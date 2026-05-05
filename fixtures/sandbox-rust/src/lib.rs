pub fn enqueue(queue: &mut Vec<i32>, item: i32) {
    queue.push(item);
}

pub fn dequeue(queue: &mut Vec<i32>) -> Option<i32> {
    if queue.is_empty() {
        None
    } else {
        Some(queue.remove(0))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn enqueue_then_dequeue_is_fifo() {
        let mut q = Vec::new();
        enqueue(&mut q, 1);
        enqueue(&mut q, 2);
        assert_eq!(dequeue(&mut q), Some(1));
        assert_eq!(dequeue(&mut q), Some(2));
        assert_eq!(dequeue(&mut q), None);
    }
}
